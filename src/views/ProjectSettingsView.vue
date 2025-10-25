<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Project Settings</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">Manage users and access permissions for your project
                </p>
            </div>
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-lg flex items-center justify-center" v-if="currentProject"
                        :style="{ background: `linear-gradient(to bottom right, ${currentProject.color1}, ${currentProject.color2})` }">
                        <span class="text-white font-bold text-2xl">{{ currentProject.initials }}</span>
                    </div>
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ currentProject?.name }}</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ projectUsers.length }} member(s)</p>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Project Members</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage who has access to this
                                project</p>
                        </div>
                        <button @click="showAddUserModal = true"
                            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-black dark:text-white rounded-lg transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clip-rule="evenodd" />
                            </svg>
                            Add Member
                        </button>
                    </div>
                </div>
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                    <div v-for="user in projectUsers" :key="user.id"
                        class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span class="text-white font-semibold text-lg">{{ getUserInitials(user.username)
                                        }}</span>
                                </div>
                                <div>
                                    <h4 class="text-base font-semibold text-gray-900 dark:text-white">{{ user.username
                                        }}</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span v-if="user.id === currentProject?.user_id"
                                    class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                                    Owner
                                </span>
                                <span v-else
                                    class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                                    Member
                                </span>
                                <button v-if="user.id !== currentProject?.user_id" @click="removeUser(user.id)"
                                    class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="projectUsers.length === 0" class="p-12 text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p class="text-gray-600 dark:text-gray-400">No members yet. Add your first team member!</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showAddUserModal" @click="showAddUserModal = false"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div @click.stop class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Project Member</h3>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search Users
                    </label>
                    <input v-model="searchQuery" @input="searchUsers" type="text"
                        placeholder="Enter username or email..."
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                <div v-if="searchResults.length > 0"
                    class="mb-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button v-for="user in searchResults" :key="user.id" @click="addUser(user)"
                        class="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div
                            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold">{{ getUserInitials(user.username) }}</span>
                        </div>
                        <div class="text-left">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.username }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                        </div>
                    </button>
                </div>
                <div v-if="searchQuery && searchResults.length === 0"
                    class="text-center py-4 text-gray-500 dark:text-gray-400">
                    No users found
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button @click="showAddUserModal = false"
                        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    initials: string;
    color1: string;
    color2: string;
    user_id: number;
}

export default {
    name: 'ProjectSettingsView',
    data() {
        return {
            currentProject: null as Project | null,
            projectUsers: [] as User[],
            showAddUserModal: false,
            searchQuery: '',
            searchResults: [] as User[]
        };
    },
    created() {
        this.loadCurrentProject();
        this.loadProjectUsers();
        window.addEventListener('project-changed', this.handleProjectChange);
    },
    beforeUnmount() {
        window.removeEventListener('project-changed', this.handleProjectChange);
    },
    methods: {
        handleProjectChange(event: any) {
            this.currentProject = event.detail;
            this.loadProjectUsers();
        },
        loadCurrentProject() {
            const projectId = localStorage.getItem('currentProjectId');
            if (projectId) {
                axios.get(`http://localhost:6709/api/projects/${projectId}`)
                    .then(res => {
                        this.currentProject = res.data;
                    })
                    .catch(err => {
                        console.error('Error loading project:', err);
                    });
            }
        },
        async loadProjectUsers() {
            const projectId = localStorage.getItem('currentProjectId');
            if (!projectId) return;

            try {
                const response = await axios.get(`http://localhost:6709/api/projects/${projectId}/users`);
                this.projectUsers = response.data;
            } catch (error) {
                console.error('Error loading project users:', error);
            }
        },
        async searchUsers() {
            if (!this.searchQuery || this.searchQuery.length < 2) {
                this.searchResults = [];
                return;
            }

            try {
                const response = await axios.get(`http://localhost:6709/api/users/search?q=${this.searchQuery}`);
                // Filter out users already in the project
                this.searchResults = response.data.filter((user: User) =>
                    !this.projectUsers.some(pu => pu.id === user.id)
                );
            } catch (error) {
                console.error('Error searching users:', error);
            }
        },
        async addUser(user: User) {
            const projectId = localStorage.getItem('currentProjectId');
            if (!projectId) return;

            try {
                await axios.post(`http://localhost:6709/api/projects/${projectId}/users`, {
                    user_id: user.id
                });
                this.projectUsers.push(user);
                this.showAddUserModal = false;
                this.searchQuery = '';
                this.searchResults = [];
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Failed to add user to project');
            }
        },
        async removeUser(userId: number) {
            if (!confirm('Are you sure you want to remove this user from the project?')) {
                return;
            }

            const projectId = localStorage.getItem('currentProjectId');
            if (!projectId) return;

            try {
                await axios.delete(`http://localhost:6709/api/projects/${projectId}/users/${userId}`);
                this.projectUsers = this.projectUsers.filter(u => u.id !== userId);
            } catch (error) {
                console.error('Error removing user:', error);
                alert('Failed to remove user from project');
            }
        },
        getUserInitials(username: string): string {
            return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || username.slice(0, 2).toUpperCase();
        }
    }
};
</script>

<style scoped>
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }
}
</style>
