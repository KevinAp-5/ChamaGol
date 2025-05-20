package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.common.ResponseMessage;
import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.dto.user.SubscriptionDTO;
import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.user.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/update")
    public ResponseEntity<UserResponseDTO> updateUser(@RequestBody @Valid UserResponseDTO dto) {
        var updatedUser = userService.updateUser(dto);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findUserById(@PathVariable @Positive @NotNull Long id) {
        return ResponseEntity.ok(userService.findUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessage> deleteUserById(@PathVariable @Positive @NotNull Long id) {
        boolean response = userService.deleteUserById(id);
        if (!response)
            return ResponseEntity.status(404).body(new ResponseMessage("User to be deleted not found with ID: " + id));
        return ResponseEntity.ok(new ResponseMessage("User deleted successfully with ID: " + id));
    }

    @DeleteMapping
    public ResponseEntity<ResponseMessage> deleteUserByLogin(@RequestBody @Valid DeleteByLoginDTO data) {
        boolean response = userService.deleteUserByLogin(data);
        if (response)
            return ResponseEntity.ok().build();

        return ResponseEntity.status(404).body(new ResponseMessage("User to be deleted not found."));
    }

    @GetMapping("subscription")
    @ResponseBody
    public ResponseEntity<SubscriptionDTO> getUserSignature(@AuthenticationPrincipal User user) {
        log.info("user {}", user);
        return ResponseEntity.ok(new SubscriptionDTO(user.getSubscription().getValue()));
    }

}
