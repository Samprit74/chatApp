package com.chat_app.controllers;

import com.chat_app.models.Message;
import com.chat_app.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MessageControl {

    @Autowired
    private MessageRepository repo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // send message to specific chat room
    @MessageMapping("/message/{chatId}")
    public void sendMessage(@DestinationVariable Long chatId, Message message){

        repo.save(message);

        messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
    }

    // fetch old messages by chatId
    @GetMapping("/messages/{chatId}")
    public List<Message> getMessages(@PathVariable Long chatId){
        return repo.findByChatId(chatId);
    }
}