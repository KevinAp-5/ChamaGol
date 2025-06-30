package com.usermanager.manager.service.auth;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.dto.authentication.AuthenticationDTO;
import com.usermanager.manager.dto.authentication.CreateUserDTO;
import com.usermanager.manager.dto.authentication.PasswordResetDTO;
import com.usermanager.manager.dto.authentication.PasswordResetWithEmailDTO;
import com.usermanager.manager.dto.authentication.TokensDTO;
import com.usermanager.manager.dto.authentication.UserCreatedDTO;
import com.usermanager.manager.dto.authentication.UserEmailDTO;
import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.enums.Status;
import com.usermanager.manager.exception.authentication.PasswordFormatNotValidException;
import com.usermanager.manager.exception.user.UserExistsException;
import com.usermanager.manager.exception.user.UserNotEnabledException;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.model.security.RefreshToken;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.verification.VerificationToken;
import com.usermanager.manager.model.verification.enums.TokenType;
import com.usermanager.manager.service.user.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;

// TODO: migrar para interface para diminuir acoplamento
@Service
@Slf4j
public class AuthService implements UserDetailsService {

    private final UserService userService;
    private final TokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenService verificationService;
    private final MailService mailService;
    private final RefreshTokenService refreshTokenService;
    private AuthenticationManager authenticationManager;

    public AuthService(UserService userService, @Lazy AuthenticationManager authenticationManager,
            TokenProvider tokenProvider, PasswordEncoder passwordEncoder,
            VerificationTokenService verificationService, MailService mailService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.verificationService = verificationService;
        this.mailService = mailService;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userService.findUserByLoginOptional(username)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas: verifique email ou senha."));

    }

        @Transactional
        public UserCreatedDTO register(@NotNull @Valid CreateUserDTO dto) {
            log.info("register attempt: {}", dto.login());

            // Caso o usuário já esteja habilitado e tenha feito login, vai informar que já é uma conta
            Optional<User> userOptional = userService.findUserEntityByLoginOptional(dto.login());
            if (userOptional.isPresent() && (userOptional.get().isEnabled()) && userOptional.get().getLastLogin() != null) {
                throw new UserExistsException(dto.login());
            }

            if (dto.password().length() < 6) {
                throw new PasswordFormatNotValidException("A senha deve conter no mínimo 6 caractéres.");
            }

            User user;
            if (userOptional.isPresent()) {
                user = userOptional.get();
                user.setName(dto.name());
                user.setPassword(passwordEncoder.encode(dto.password()));
                user.setUpdatedAt(ZonedDateTime.now());
                user = userService.save(user); // use save para update
            } else {
                String encryptedPassword = passwordEncoder.encode(dto.password());
                log.info("tentando registro para {}", dto.login());
                user = userService.save(new User(dto.name(), dto.login(), encryptedPassword));
            }

            VerificationToken verificationToken = verificationService.generateVerificationToken(user,
                    TokenType.EMAIL_VALIDATION);

            mailService.sendVerificationMail(user.getLogin(), verificationToken.getUuid().toString());

            log.info("register successfull {}", dto.login());
            return new UserCreatedDTO(user);
        }

    @Transactional
    public TokensDTO login(@Valid AuthenticationDTO data) {
        log.info("login attempt by {}", data.login());

        var user = userService.findUserByLogin(data.login());

        if (!user.isEnabled()) {
            log.info("user {} not enabled. unable to login", data.login());
            throw new UserNotEnabledException("Please activate the email " + user.getLogin());
        }

        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());

        if (!passwordEncoder.matches(data.password(), user.getPassword())) {
            throw new BadCredentialsException("Bad credentials: verify login or password.");
        }

        user.setLastLogin(ZonedDateTime.now());
        userService.save(user);

        Authentication auth = authenticationManager.authenticate(usernamePassword);
        log.info("user {} sucessfully authenticated", data.login());
        String acessToken =  tokenProvider.generateToken((User) auth.getPrincipal());
        String refreshToken = refreshTokenService.createRefreshToken(user);
        log.info("user {} sucessfully generated refresh token", data.login());
        return new TokensDTO(acessToken, refreshToken);
    }

    @Transactional
    public TokensDTO refreshToken(@NotBlank String token) {
        log.info("refresh token attempt by {}", token);
        RefreshToken refreshToken = refreshTokenService.findByToken(token);

        String accessToken = tokenProvider.generateToken(refreshToken.getUser());
        String newRefreshToken = refreshTokenService.createRefreshToken(refreshToken.getUser());

        refreshTokenService.invalidateToken(token);
        log.info("user {} sucessfully generated refresh token", refreshToken.getUser().getLogin());
        return new TokensDTO(accessToken, newRefreshToken);
    }


    @Transactional
    public boolean sendActivationCode(@Email @NotBlank String email) {
        User user = userService.findUserByLogin(email);

        if (user.isEnabled()) {
            return false;
        }

        var verificationToken = verificationService.generateVerificationToken(user, TokenType.EMAIL_VALIDATION);
        mailService.sendVerificationMail(user.getLogin(), verificationToken.getUuid().toString());
        return true;
    }

    @Transactional
    public boolean sendPasswordResetCode(@Valid UserEmailDTO data) {
        var userOptional = userService.findUserByLoginOptional(data.email());

        if (userOptional.isEmpty()) {
            return false;
        }

        var user = (User) userOptional.get();

        if (!user.isEnabled()) {
            return false;
        }

        userService.save(user);
        var verificationToken = verificationService.generateVerificationToken(user, TokenType.RESET_PASSWORD);
        mailService.sendResetPasswordEmail(user.getLogin(), verificationToken.getUuid().toString());
        return true;
    }

    @Transactional
    public void passwordReset(@NotBlank UUID token, @Valid PasswordResetDTO data) {
        var verificationToken = verificationService.findVerificationByToken(token);
        User user = verificationToken.getUser();
        log.info("user {} has requested a password change.", user.getLogin());

        // Updates password and saves it
        user.setPassword(passwordEncoder.encode(data.newPassword()));
        user.setUpdatedAt(ZonedDateTime.now());
        userService.save(user);
        log.info("user {} has changed password", user.getLogin());

        // Updates verificationToken to set it as activated/enabled
        verificationToken.setActivationDate(ZonedDateTime.now().toInstant());
        verificationToken.setActivated(true);
        verificationService.saveVerificationToken(verificationToken);
    }

    @Transactional
    public boolean confirmEmail(@NotBlank UUID token) {
        var verificationToken = verificationService.findByIdOrElseNull(token);
        if (verificationToken == null) {
            return false;
        }

        User user = verificationToken.getUser();
        log.info("user {} has confirmed email", user.getLogin());

        // Enables user and saves it
        user.setEnabled(true);
        user.setStatus(Status.ACTIVE);
        userService.save(user);

        // Updates verificationToken to set it as activated/enabled
        verificationToken.setActivationDate(ZonedDateTime.now().toInstant());
        verificationToken.setActivated(true);
        verificationService.saveVerificationToken(verificationToken);
        return true;
    }

    @Transactional
    public void passwordReset(@Valid PasswordResetWithEmailDTO data) {
        var user = userService.findUserByLogin(data.email());
        user.setEnabled(true);
        userService.save(user);

        var verificationToken = verificationService.findVerificationByUser(user);
        user.setPassword(passwordEncoder.encode(data.password()));
        user.setUpdatedAt(ZonedDateTime.now());
        userService.save(user);
        verificationToken.setActivationDate(ZonedDateTime.now().toInstant());
        verificationToken.setActivated(true);
        verificationService.saveVerificationToken(verificationToken);
    }

    public boolean isEmailConfirmed(UserEmailDTO data) {
        var user = userService.findUserByLogin(data.email());
        return user.isEnabled();
    }

    public User findUserByLogin(@NotBlank String email) {
        return userService.findUserByLogin(email);
    }

    public boolean confirmVerificationToken(UUID uuid) {
        return verificationService.confirmVerificationToken(uuid);
    }

    public VerificationToken findVerificationByUser(User user) {
        return verificationService.findVerificationByUser(user);
    }
}
