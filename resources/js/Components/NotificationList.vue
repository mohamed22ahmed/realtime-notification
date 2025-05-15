<template>
    <div>
        <h2>Notifications</h2>
        <ul>
            <li v-for="(notification, index) in notifications" :key="index">
                {{ notification.message }}
            </li>
        </ul>
    </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
    data() {
        return {
            notifications: [],
            user_id: null,
        };
    },
    mounted() {
        axios.get(route('getAuthUserId')).then((response) => {
            this.user_id = response.data
            const socket = io('http://localhost:3000');
            socket.emit('register', this.user_id);
            socket.on(`notification:${this.user_id}`, (data) => {
                console.log("Notification received:", data);
                this.notifications.push(data);
            });
        })

    },
};
</script>
