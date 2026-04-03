import { db, auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// UI Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('admin-login-form');
const logoutBtn = document.getElementById('logout-btn');

// ==========================================
// 🔒 1. BULLETPROOF SECURITY & LOGIN/LOGOUT
// ==========================================

// Firebase check karega ki user logged in hai ya nahi
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ✅ Agar Login Sahi Hai: Dashboard dikhao aur Data Load karo
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'inline-block';
        
        loadAdminData(); // Data sirf tabhi aayega jab ye line chalegi!
    } else {
        // ❌ Agar Login Nahi Hai: Sab hide karo aur sirf Form dikhao
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
});

// Login Button Logic
if(loginForm){
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-pass').value;
        const loginBtn = document.getElementById('login-btn');
        
        loginBtn.innerText = "Checking...";
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            // Login successful hote hi onAuthStateChanged apne aap dashboard khol dega
        } catch (error) {
            alert("Wrong Email or Password! Try again.");
        } finally {
            loginBtn.innerText = "Login to Dashboard";
        }
    });
}

// Logout Button Logic (FIXED)
if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Aap safely logout ho chuke hain! 🔒");
            window.location.reload(); // Page ko forcibly refresh aur lock karne ke liye
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}

// ==========================================
// 🚀 2. ADMIN DATA LOGIC (LOCKED INSIDE FUNCTION)
// ==========================================

function loadAdminData() {
    // Ye function sirf tab chalega jab user login kar chuka hoga
    
    // Add Video Form Logic
    const addVideoForm = document.getElementById('add-video-form');
    if (addVideoForm) {
        addVideoForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('video-title').value;
            const link = document.getElementById('video-link').value;
            const date = document.getElementById('video-date').value;
            const time = document.getElementById('video-time').value;

            let videoId = link.includes("v=") ? link.split("v=")[1].substring(0, 11) : (link.includes("youtu.be/") ? link.split("youtu.be/")[1].substring(0, 11) : "");
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://via.placeholder.com/600x400?text=No+Thumbnail";

            const submitBtn = addVideoForm.querySelector('.submit-btn');
            submitBtn.innerText = "Publishing...";

            try {
                await addDoc(collection(db, "upcoming_videos"), {
                    title, youtubeLink: link, thumbnail: thumbnailUrl, releaseDate: date, releaseTime: time, createdAt: serverTimestamp()
                });
                alert("Video Published Successfully!");
                addVideoForm.reset();
            } catch (e) { alert("Error Publishing Video!"); } 
            finally { submitBtn.innerText = "Publish to Website"; }
        };
    }

    // Manage Videos List Logic
    if(!document.getElementById('manage-videos-list')){
        const videoListContainer = document.createElement('div');
        videoListContainer.innerHTML = "<h3 style='margin-top:30px; color:#f39c12; border-bottom:1px solid #333; padding-bottom:10px;'>🗑️ Manage Videos</h3><div id='manage-videos-list'></div>";
        document.querySelectorAll('.admin-card')[0].appendChild(videoListContainer);
    }

    onSnapshot(query(collection(db, "upcoming_videos"), orderBy("createdAt", "desc")), (snapshot) => {
        const listDiv = document.getElementById('manage-videos-list');
        if(!listDiv) return;
        listDiv.innerHTML = "";
        snapshot.forEach((videoDoc) => {
            const data = videoDoc.data();
            listDiv.innerHTML += `
                <div class="admin-review-item">
                    <div class="review-details">
                        <strong>${data.title}</strong>
                        <p style="color:#888; font-size:0.8rem;">${data.releaseDate}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="delete-btn video-del" data-id="${videoDoc.id}">Remove</button>
                    </div>
                </div>
            `;
        });
        document.querySelectorAll('.video-del').forEach(btn => {
            btn.onclick = async (e) => {
                if(confirm("Remove this video?")) await deleteDoc(doc(db, "upcoming_videos", e.target.getAttribute('data-id')));
            };
        });
    });

    // Manage Reviews Logic
    onSnapshot(query(collection(db, "reviews"), orderBy("createdAt", "desc")), (snapshot) => {
        const adminReviewsList = document.getElementById('admin-reviews-container');
        if(!adminReviewsList) return;
        adminReviewsList.innerHTML = "";
        snapshot.forEach((reviewDoc) => {
            const data = reviewDoc.data();
            adminReviewsList.innerHTML += `
                <div class="admin-review-item">
                    <div class="review-details">
                        <strong>${data.name} <span style="font-size:0.8rem; color:#888;">(${data.email})</span></strong>
                        <p>"${data.review}"</p>
                    </div>
                    <div class="admin-actions">
                        <label class="show-toggle"><input type="checkbox" class="approve-check" data-id="${reviewDoc.id}" ${data.isApproved ? 'checked' : ''}> Show</label>
                        <button class="delete-btn review-del" data-id="${reviewDoc.id}" style="margin-top:8px;">Delete</button>
                    </div>
                </div>
            `;
        });
        document.querySelectorAll('.approve-check').forEach(check => {
            check.onchange = async (e) => await updateDoc(doc(db, "reviews", e.target.getAttribute('data-id')), { isApproved: e.target.checked });
        });
        document.querySelectorAll('.review-del').forEach(btn => {
            btn.onclick = async (e) => {
                if(confirm("Delete permanently?")) await deleteDoc(doc(db, "reviews", e.target.getAttribute('data-id')));
            };
        });
    });
}
