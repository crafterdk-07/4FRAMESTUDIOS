import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. ADD UPCOMING VIDEO LOGIC
// ==========================================
const addVideoForm = document.getElementById('add-video-form');
if (addVideoForm) {
    addVideoForm.addEventListener('submit', async (e) => {
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
        } catch (e) { 
            alert("Error Publishing Video!"); 
            console.error(e);
        } finally {
            submitBtn.innerText = "Publish to Website";
        }
    });
}

// ==========================================
// 2. MANAGE UPLOADED VIDEOS LOGIC
// ==========================================
// Creating a container for video list inside the first admin card
const videoListContainer = document.createElement('div');
videoListContainer.innerHTML = "<h3 style='margin-top:30px; color:#f39c12; border-bottom:1px solid #333; padding-bottom:10px;'>🗑️ Manage Videos</h3><div id='manage-videos-list'></div>";
document.querySelectorAll('.admin-card')[0].appendChild(videoListContainer);

onSnapshot(query(collection(db, "upcoming_videos"), orderBy("createdAt", "desc")), (snapshot) => {
    const listDiv = document.getElementById('manage-videos-list');
    if(!listDiv) return;
    listDiv.innerHTML = "";

    snapshot.forEach((videoDoc) => {
        const data = videoDoc.data();
        const item = document.createElement('div');
        item.className = "admin-review-item";
        item.innerHTML = `
            <div class="review-details">
                <strong>${data.title}</strong>
                <p style="color:#888; font-size:0.8rem;">${data.releaseDate}</p>
            </div>
            <div class="admin-actions">
                <button class="delete-btn video-del" data-id="${videoDoc.id}">Remove</button>
            </div>
        `;
        listDiv.appendChild(item);
    });

    // Delete Video Actions
    document.querySelectorAll('.video-del').forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.target.getAttribute('data-id');
            if(confirm("Are you sure you want to remove this video from the website?")) {
                await deleteDoc(doc(db, "upcoming_videos", id));
            }
        };
    });
});

// ==========================================
// 3. MANAGE REVIEWS LOGIC
// ==========================================
onSnapshot(query(collection(db, "reviews"), orderBy("createdAt", "desc")), (snapshot) => {
    const adminReviewsList = document.getElementById('admin-reviews-container');
    if(!adminReviewsList) return;
    
    adminReviewsList.innerHTML = "";

    snapshot.forEach((reviewDoc) => {
        const data = reviewDoc.data();
        const item = document.createElement('div');
        item.className = "admin-review-item";
        item.innerHTML = `
            <div class="review-details">
                <strong>${data.name} <span style="font-size:0.8rem; color:#888;">(${data.email})</span></strong>
                <p>"${data.review}"</p>
            </div>
            <div class="admin-actions">
                <label class="show-toggle">
                    <input type="checkbox" class="approve-check" data-id="${reviewDoc.id}" ${data.isApproved ? 'checked' : ''}> Show
                </label>
                <button class="delete-btn review-del" data-id="${reviewDoc.id}" style="margin-top:8px;">Delete</button>
            </div>
        `;
        adminReviewsList.appendChild(item);
    });

    // Toggle Review Approval (Show/Hide)
    document.querySelectorAll('.approve-check').forEach(check => {
        check.onchange = async (e) => {
            const id = e.target.getAttribute('data-id');
            const status = e.target.checked;
            await updateDoc(doc(db, "reviews", id), { isApproved: status });
        };
    });

    // Delete Review
    document.querySelectorAll('.review-del').forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.target.getAttribute('data-id');
            if(confirm("Delete this review permanently?")) {
                await deleteDoc(doc(db, "reviews", id));
            }
        };
    });
});