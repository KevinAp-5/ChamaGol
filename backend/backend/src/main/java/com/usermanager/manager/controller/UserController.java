package com.usermanager.manager.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.common.ResponseMessage;
import com.usermanager.manager.dto.user.DeleteByLoginDTO;
import com.usermanager.manager.dto.user.VipUserDTO;
import com.usermanager.manager.dto.user.SubscriptionDTO;
import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.user.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Usuários", description = "Endpoints de gerenciamento de usuários")
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Atualizar usuário")
    @ApiResponse(responseCode = "200", description = "Usuário atualizado")
    @PutMapping("/update")
    public ResponseEntity<UserResponseDTO> updateUser(
        @RequestBody(
            description = "Dados do usuário para atualização",
            required = true,
            content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
        )
        @org.springframework.web.bind.annotation.RequestBody @Valid UserResponseDTO dto
    ) {
        var updatedUser = userService.updateUser(dto);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Listar todos os usuários")
    @ApiResponse(responseCode = "200", description = "Lista de usuários")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Listar usuários paginados")
    @ApiResponse(responseCode = "200", description = "Lista de usuários paginados")
    @GetMapping("/page")
    public ResponseEntity<Page<UserDTO>> getUsersPage(
        @Parameter(description = "Número da página (0-based)") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Tamanho da página") @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(userService.getUsersPage(page, size));
    }

    @Operation(summary = "Buscar usuário por ID")
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findUserById(
        @Parameter(description = "ID do usuário", required = true) @PathVariable @Positive @NotNull Long id
    ) {
        return ResponseEntity.ok(userService.findUserById(id));
    }

    @Operation(summary = "Deletar usuário por ID")
    @ApiResponse(responseCode = "200", description = "Usuário deletado")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessage> deleteUserById(
        @Parameter(description = "ID do usuário", required = true) @PathVariable @Positive @NotNull Long id
    ) {
        boolean response = userService.deleteUserById(id);
        if (!response)
            return ResponseEntity.status(404).body(new ResponseMessage("User to be deleted not found with ID: " + id));
        return ResponseEntity.ok(new ResponseMessage("User deleted successfully with ID: " + id));
    }

    @Operation(summary = "Deletar usuário por login")
    @ApiResponse(responseCode = "200", description = "Usuário deletado")
    @DeleteMapping
    public ResponseEntity<ResponseMessage> deleteUserByLogin(
        @RequestBody(
            description = "Login do usuário para deleção",
            required = true,
            content = @Content(schema = @Schema(implementation = DeleteByLoginDTO.class))
        )
        @org.springframework.web.bind.annotation.RequestBody @Valid DeleteByLoginDTO data
    ) {
        boolean response = userService.deleteUserByLogin(data);
        if (response)
            return ResponseEntity.ok().build();

        return ResponseEntity.status(404).body(new ResponseMessage("User to be deleted not found."));
    }

    @Operation(summary = "Obter assinatura do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Assinatura retornada")
    @GetMapping("subscription")
    @ResponseBody
    public ResponseEntity<SubscriptionDTO> getUserSignature(
        @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user
    ) {
        log.info("user {}", user);
        return ResponseEntity.ok(new SubscriptionDTO(user.getSubscription().getValue()));
    }

    @GetMapping("vip")
    public ResponseEntity<List<VipUserDTO>> getsUsersVip() {
            return ResponseEntity.ok(userService.getUsersVipPage());
        }
}
