package api_workspace.exception;

import api_workspace.dto.error.ErrorResponse;
import api_workspace.dto.error.ValidationErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex){

        ErrorResponse response =

                new ErrorResponse(

                        HttpStatus.BAD_REQUEST.value(),

                        ex.getMessage(),

                        LocalDateTime.now()
                );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse>
    handleValidationException(
            MethodArgumentNotValidException ex){

        Map<String,String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->

                        errors.put(

                                error.getField(),

                                error.getDefaultMessage()
                        ));

        ValidationErrorResponse response =

                new ValidationErrorResponse(

                        HttpStatus.BAD_REQUEST.value(),

                        "Validation Failed",

                        errors,

                        LocalDateTime.now()
                );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse>
    handleException(Exception ex){

        ErrorResponse response =

                new ErrorResponse(

                        HttpStatus.INTERNAL_SERVER_ERROR.value(),

                        "Something went wrong.",

                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse>
    handleNotFound(ResourceNotFoundException ex){

        ErrorResponse response =

                new ErrorResponse(

                        HttpStatus.NOT_FOUND.value(),

                        ex.getMessage(),

                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }
}