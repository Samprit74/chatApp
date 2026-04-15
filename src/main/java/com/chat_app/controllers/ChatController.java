package com.chat_app.controllers;

import com.chat_app.models.Chat;
import com.chat_app.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatRepository chatRepository;

    // create new chat room
    @PostMapping("/create")
    public Chat createChat(@RequestBody Chat chat){
        return chatRepository.save(chat);
    }

    // get chat by id
    @GetMapping("/{id}")
    public Chat getChat(@PathVariable Long id){
        Optional<Chat> chat = chatRepository.findById(id);
        return chat.orElse(null);
    }

    // get all chat rooms
    @GetMapping("/all")
    public List<Chat> getAllChats(){
        return chatRepository.findAll();
    }
}