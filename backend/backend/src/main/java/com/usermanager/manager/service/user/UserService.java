package com.usermanager.manager.service.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.dto.user.ProUserDTO;
import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.exception.user.UserNotFoundException;
import com.usermanager.manager.mappers.UserMapper;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.SubscriptionRepository;
import com.usermanager.manager.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.extern.slf4j.Slf4j;

// TODO: migrar para interface para diminuir acoplamento

@Service
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SubscriptionRepository subscriptionRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder,
            SubscriptionRepository subscriptionControlRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.subscriptionRepository = subscriptionControlRepository;
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

    public User findById(@Positive @NotNull Long id) {
        return userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("with ID: " + id));
    }

    public Optional<User> findByIdOptional(@Positive @NotNull Long id) {
        return userRepository.findById(id);
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
    public User save(@Valid User user) {
        return userRepository.save(user);
    }

    public User findUserByLogin(@NotBlank String login) {
        return (User) userRepository.findByLogin(login).orElseThrow(
                () -> new UserNotFoundException(login));
    }

    public Optional<UserDetails> findUserByLoginOptional(@NotBlank String login) {
        return userRepository.findByLogin(login);
    }

    public Optional<User> findUserEntityByLoginOptional(@NotBlank String login) {
        return userRepository.findUserByLogin(login);
    }

    public boolean existsByLogin(@NotBlank String login) {
        return userRepository.existsByLogin(login);
    }

    public void saveAll(@NotNull Iterable<User> users) {
        userRepository.saveAll(users);
    }

    public Page<UserDTO> getUsersPage(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size))
                .map(x -> userMapper.userToUserDTO(x));
    }

    public List<ProUserDTO> getUsersProPage() {
        return subscriptionRepository.findAll().stream()
            .map(ProUserDTO::new)
            .toList();
    }
}