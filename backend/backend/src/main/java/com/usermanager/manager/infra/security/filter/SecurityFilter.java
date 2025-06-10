package com.usermanager.manager.infra.security.filter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.usermanager.manager.exception.authentication.TokenInvalid;
import com.usermanager.manager.model.security.TokenProvider;
import com.usermanager.manager.repository.UserRepository;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SecurityFilter extends OncePerRequestFilter {

    private TokenProvider tokenProvider;
    private UserRepository userRepository;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public SecurityFilter(TokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        

        String ip = request.getRemoteAddr();
        log.info("new request with ip: {}", ip);
        Bucket bucket = resolveBucket(ip);
        try {
            var token = this.recoverToken(request);
            if (token != null) {
                var authentication = createAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            }
            else {
                response.setStatus(429);
                response.getWriter().write("Too many requests. Tente novamente mais tarde.");;
            }

        } catch (TokenInvalid e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    String.format("{\"error\": \"%s\"}", e.getMessage()));
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write(
                    String.format("{\"error\": \"Internal server error: %s\"}", e.getMessage()));
        }
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null)
            return null;
        return authHeader.replace("Bearer ", "");
    }

    private UsernamePasswordAuthenticationToken createAuthentication(String token) {
        String login = tokenProvider.validateToken(token);
        UserDetails user = userRepository.findByLogin(login).orElseThrow(
                () -> new BadCredentialsException("Bad credentials: verify login or password"));

        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities());
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(30)
                .refillGreedy(1, Duration.ofMinutes(6))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket resolveBucket(String ip) {
        return buckets.computeIfAbsent(ip, k -> createNewBucket());
    }
}
