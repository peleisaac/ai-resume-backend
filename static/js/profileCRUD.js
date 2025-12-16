/**
 * Profile CRUD Operations
 * Handles Create, Read, Update, Delete for user profiles
 */

class ProfileCRUD {
    constructor() {
        this.token = this.getToken();
        this.userId = this.getUserId();
    }

    getToken() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    }

    getUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.user_id;
    }

    /**
     * READ - Fetch user profile
     */
    async getProfile(userId) {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/users/${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    }
                }
            );

            const data = await response.json();

            if (data.status_code === 200) {
                window.notify.success('Profile loaded successfully');
                return data.user;
            } else {
                window.notify.error(
                    data.message || 'Failed to load profile'
                );
                return null;
            }
        } catch (error) {
            window.notify.error('Error loading profile');
            console.error('Profile fetch error:', error);
            return null;
        }
    }

    /**
     * UPDATE - Update user profile
     */
    async updateProfile(userId, profileData) {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/user/${userId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify(profileData)
                }
            );

            const data = await response.json();

            if (data.status_code === 200) {
                window.notify.success('Profile updated successfully!');
                
                // Update localStorage
                const user = JSON.parse(
                    localStorage.getItem('user') || '{}'
                );
                Object.assign(user, data.user);
                localStorage.setItem('user', JSON.stringify(user));
                
                return data.user;
            } else {
                window.notify.error(
                    data.message || 'Failed to update profile'
                );
                return null;
            }
        } catch (error) {
            window.notify.error('Error updating profile');
            console.error('Profile update error:', error);
            return null;
        }
    }

    /**
     * DELETE - Deactivate user account
     */
    async deleteProfile(userId) {
        if (!confirm(
            'Are you sure you want to delete your account? ' +
            'This action cannot be undone.'
        )) {
            return false;
        }

        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/user/delete/${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    }
                }
            );

            const data = await response.json();

            if (data.status_code === 200) {
                window.notify.success('Account deleted successfully');
                
                // Clear localStorage and redirect
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                
                return true;
            } else {
                window.notify.error(
                    data.message || 'Failed to delete account'
                );
                return false;
            }
        } catch (error) {
            window.notify.error('Error deleting account');
            console.error('Profile delete error:', error);
            return false;
        }
    }

    /**
     * Helper: Populate form with profile data
     */
    populateForm(profileData) {
        Object.keys(profileData).forEach(key => {
            const input = document.getElementById(key) || 
                         document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = profileData[key];
                } else {
                    input.value = profileData[key] || '';
                }
            }
        });
    }

    /**
     * Helper: Extract form data
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }
}

// Create global instance
window.profileCRUD = new ProfileCRUD();
