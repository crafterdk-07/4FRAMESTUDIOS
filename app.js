import { db } from './firebase.js';
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp, where, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. UPCOMING VIDEOS LOAD KARNE KA LOGIC
// ==========================================
const videoContainer = document.getElementById('video-container');

if (videoContainer) {
    async function loadVideos() {
        videoContainer.innerHTML = "<p style='text-align:center;'>Loading videos...</p>";
        try {
            const q = query(collection(db, "upcoming_videos"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            videoContainer.innerHTML = ""; 

            if(querySnapshot.empty) {
                videoContainer.innerHTML = "<p style='text-align:center;'>No upcoming videos found.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const video = doc.data();
                const videoCard = `
                    <div class="video-card">
                        <img src="${video.thumbnail}" alt="Thumbnail" class="thumbnail">
                        <div class="video-info">
                            <h3>${video.title}</h3>
                            <p class="release-date">Releasing: ${video.releaseDate} | ${video.releaseTime}</p>
                            <a href="${video.youtubeLink}" target="_blank" class="watch-btn">Watch on YouTube</a>
                        </div>
                    </div>
                `;
                videoContainer.innerHTML += videoCard;
            });
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    }
    loadVideos();
}

// ==========================================
// 2. REVIEW SUBMIT KARNE KA LOGIC
// ==========================================
const reviewForm = document.getElementById('review-form');

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('reviewer-name').value;
        const email = document.getElementById('reviewer-email').value;
        const desc = document.getElementById('reviewer-desc').value;
        const submitBtn = reviewForm.querySelector('.submit-btn');

        submitBtn.innerText = "Submitting...";

        try {
            await addDoc(collection(db, "reviews"), {
                name: name,
                email: email,
                review: desc,
                isApproved: false, // Hidden by default
                createdAt: serverTimestamp()
            });
            alert("Review submitted! Admin approval ke baad ye live dikhega.");
            reviewForm.reset();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            submitBtn.innerText = "Submit Review";
        }
    });
}

// ==========================================
// 3. APPROVED REVIEWS DIKHANE KA LOGIC
// ==========================================
const reviewGrid = document.getElementById('public-reviews');

if (reviewGrid) {
    async function loadApprovedReviews() {
        const q = query(collection(db, "reviews"), where("isApproved", "==", true), limit(3));
        const querySnapshot = await getDocs(q);
        
        reviewGrid.innerHTML = ""; // Clear dummy data

        if(querySnapshot.empty) {
            reviewGrid.innerHTML = "<p style='color:#888;'>Be the first to leave a review!</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            reviewGrid.innerHTML += `
                <div class="review-card">
                    <h4>${data.name}</h4>
                    <p class="review-text">"${data.review}"</p>
                </div>
            `;
        });
    }
    loadApprovedReviews();
}
