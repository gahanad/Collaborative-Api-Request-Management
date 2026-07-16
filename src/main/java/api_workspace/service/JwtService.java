package api_workspace.service;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    // 1. A cryptographically secure 256-bit string key (Replace with your own environmental variable)
    private String secretString;
    // 2. Token validity duration (1 hour in milliseconds: 60 mins * 60 secs * 1000 ms)
    private final long EXPIRATION_TIME_MS = 3600000; 

    public String generateToken(String useremail) {
        return Jwts.builder()
                .subject(useremail) // Sets the user identity
                
                // === THE MISSING LINES FILLED IN ===
                
                .issuedAt(new Date(System.currentTimeMillis())) 
                // 1. Sets the creation timestamp (iat claim) to exactly right now.
                
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS)) 
                // 2. Sets the expiration timestamp (exp claim) to exactly 1 hour from now.
                
                .signWith(getSigningKey(), Jwts.SIG.HS256) 
                // 3. Signs the token digitally using our key and the HMAC SHA-256 algorithm.
                
                // ===================================
                
                .compact(); // Encodes and bundles it into the final string
    }

    // Helper method to convert the secret string into a secure SecretKey object
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // To extract the token from authorization header:
    public String extractUserEmail(String token){
        try{
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        }
        catch(Exception e){
            return null;//Invalid token
        }
    }
    public boolean validToken(String token, String email){
        String extractedEmail = extractUserEmail(token);
        return extractedEmail != null && extractedEmail.equals(email);
    }
}
