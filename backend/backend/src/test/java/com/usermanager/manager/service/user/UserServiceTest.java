package com.usermanager.manager.service.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.exception.user.UserNotFoundException;
import com.usermanager.manager.infra.mail.MailService;
import com.usermanager.manager.mappers.UserMapper;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.model.user.UserRole;
import com.usermanager.manager.repository.UserRepository;
import com.usermanager.manager.service.auth.VerificationTokenService;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserMapper userMapper;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private VerificationTokenService verificationService;
    
    @Mock
    private MailService mailService;
    
    @InjectMocks
    private UserService userService;
    
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Test User")
                .login("test@example.com")
                .password("encodedPassword")
                .role(UserRole.ROLE_USER)
                .enabled(true)
                .build();
    }

    // Teste para updateUser - Sucesso
    @Test
    void updateUser_Success() {
        // Arrange
        UserResponseDTO dto = new UserResponseDTO("Updated Name", "test@example.com", "newPassword");
        UserResponseDTO expectedResponse = new UserResponseDTO("Updated name", "test@example.com", "newEncodedPassword");
        when(userRepository.findByLogin(dto.login())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(dto.password())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.userToUserResponseDTO(any(User.class))).thenReturn(expectedResponse);

        // Act
        UserResponseDTO result = userService.updateUser(dto);


        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    // Teste para getAllUsers
    @Test
    void getAllUsers_Success() {
        // Arrange
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userMapper.userToUserDTO(any(User.class))).thenReturn(new UserDTO(1L, "Test User", "test@example.com", "password", UserRole.ROLE_USER));

        // Act
        List<UserDTO> result = userService.getAllUsers();

        // Assert
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    // Teste para findUserById - Sucesso
    @Test
    void findUserById_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.userToUserDTO(any(User.class))).thenReturn(new UserDTO(1L, "Test User", "test@example.com", "password", UserRole.ROLE_USER));

        // Act
        UserDTO result = userService.findUserById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Test User", result.name());
    }

    // Teste para findUserById - Não encontrado
    @Test
    void findUserById_NotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.findUserById(99L));
    }

    // Teste para deleteUserById - Sucesso
    @Test
    void deleteUserById_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        boolean result = userService.deleteUserById(1L);

        // Assert
        assertTrue(result);
        assertFalse(user.getEnabled());
        verify(userRepository).save(user);
    }

    // Teste para deleteUserById - Não encontrado
    @Test
    void deleteUserById_NotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        boolean result = userService.deleteUserById(99L);

        // Assert
        assertFalse(result);
    }

    // Teste para deleteUserByLogin - Sucesso
    @Test
    void deleteUserByLogin_Success() {
        // Arrange
        DeleteByLoginDTO dto = new DeleteByLoginDTO("test@example.com");
        when(userRepository.findByLogin(dto.email())).thenReturn(Optional.of(user));

        // Act
        boolean result = userService.deleteUserByLogin(dto);

        // Assert
        assertTrue(result);
        assertFalse(user.getEnabled());
        verify(userRepository).save(user);
    }

    // Teste para saveUser
    @Test
    void saveUser_Success() {
        // Act
        userService.save(user);

        // Assert
        verify(userRepository).save(user);
    }

    // Teste para findUserByLogin - Não encontrado
    @Test
    void findUserByLogin_NotFound() {
        // Arrange
        when(userRepository.findByLogin("invalid@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, 
            () -> userService.findUserByLogin("invalid@example.com"));
    }
}
