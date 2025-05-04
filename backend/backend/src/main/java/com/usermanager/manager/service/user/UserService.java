package com.usermanager.manager.service.user;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.authentication.CreateUserDTO;
import com.usermanager.manager.dto.authentication.UserCreatedDTO;
import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.exception.authentication.PasswordFormatNotValidException;
import com.usermanager.manager.exception.user.UserExistsException;
import com.usermanager.manager.exception.user.UserNotFoundException;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.mappers.UserMapper;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.user.UserRole;
import com.usermanager.manager.model.verification.VerificationToken;
import com.usermanager.manager.model.verification.enums.TokenType;
import com.usermanager.manager.repository.UserRepository;
import com.usermanager.manager.service.auth.VerificationTokenService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class  UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationService;
    private final MailService mailService;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder,
            VerificationTokenService verificationService, MailService mailService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.verificationService = verificationService;
        this.mailService = mailService;
    }

    @Transactional
    public UserCreatedDTO createUser(@NotNull @Valid CreateUserDTO dto) {
        if (userRepository.findByLogin(dto.login()).isPresent()) {
            throw new UserExistsException(dto.login());
        }

        if (dto.password().length() < 6) {
            log.error("Password not match: {}", dto.password());
            throw new PasswordFormatNotValidException("Password must be at least 6 characters long.");
        }

        String encryptedPassword = passwordEncoder.encode(dto.password());
        User user = User.builder()
                .name(dto.name())
                .login(dto.login())
                .role(UserRole.USER)
                .password(encryptedPassword)
                .build();

        user = userRepository.save(user);

        VerificationToken verificationToken = verificationService.generateVerificationToken(user,
                TokenType.EMAIL_VALIDATION);

        mailService.sendVerificationMail(user.getLogin(), verificationToken.getUuid().toString());

        return new UserCreatedDTO(
            user.getId(),
            user.getName(),
            user.getLogin(),
            user.getEnabled()
        );
    }

    @Transactional
    public UserResponseDTO updateUser(@NotNull @Valid UserResponseDTO dto) {
        User savedUser = (User) userRepository.findByLogin(dto.login()).orElseThrow(
                () -> new UserNotFoundException("with login: " + dto.login()));

        savedUser.setName(dto.name());
        savedUser.setLogin(dto.login());
        savedUser.setPassword(passwordEncoder.encode(dto.password()));

        User updatedUser = userRepository.save(savedUser);
        return userMapper.userToUserResponseDTO(updatedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::userToUserDTO)
                .toList();
    }

    public UserDTO findUserById(@Positive @NotNull Long id) {
        User response = userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("with ID: " + id));

        return userMapper.userToUserDTO(response);
    }

    @Transactional
    public boolean deleteUserById(@Positive @NotNull Long id) {
        User userToDelete = userRepository.findById(id).orElse(null);
        if (userToDelete == null) {
            return false;
        }

        userToDelete.setEnabled(false);
        userRepository.save(userToDelete);
        return true;
    }

    @Transactional
    public boolean deleteUserByLogin(@Valid DeleteByLoginDTO data) {
        User userToDelete = (User) userRepository.findByLogin(data.email()).orElse(null);
        if (userToDelete == null)
            return false;

        userToDelete.setEnabled(false);
        userRepository.save(userToDelete);
        return true;
    }

    @Transactional
    public void saveUser(@Valid User user) {
        this.userRepository.save(user);
    }

    public User findUserByLogin(@NotBlank String login) {
        return (User) userRepository.findByLogin(login).orElseThrow(
                () -> new UserNotFoundException(login));
    }

    public Optional<UserDetails> findUserByLoginOptional(@NotBlank String login) {
        return userRepository.findByLogin(login);
    }
}
