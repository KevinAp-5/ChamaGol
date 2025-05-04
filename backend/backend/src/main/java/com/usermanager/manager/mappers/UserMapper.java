package com.usermanager.manager.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.usermanager.manager.dto.user.UserDTO;
import com.usermanager.manager.dto.user.UserResponseDTO;
import com.usermanager.manager.model.user.User;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    UserDTO userToUserDTO(User user);

    User userDTOToUser(UserDTO dto);

    UserResponseDTO userToUserResponseDTO(User user);
}
