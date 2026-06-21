// ========================================================
// 1. KONFIGURASI SUPABASE CLOUD (GLOBAL ATAS)
// ========================================================
const SUPABASE_URL = "https://wlhtnlcdvmnqdbimkqqx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable__CwCHKulvoa5mMvgN8EoPw_Hk3ZZ1Yl";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================================
// 2. LOGIKA UTAMA WEB (DOM CONTENT LOADED)
// ========================================================
document.addEventListener('DOMContentLoaded', function () {
    
    // --- FITUR A: Inisialisasi AOS Animation ---
    AOS.init({
        once: true,
        offset: 100,
        duration: 800
    });

    // --- FITUR B: Deteksi Pilihan Kelas Pada Modal ---
    const joinModal = document.getElementById('joinModal');
    if (joinModal) {
        joinModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const namaKelas = button.getAttribute('data-kelas');
            const modalInput = document.getElementById('modalKelasPilihan');
            modalInput.value = namaKelas;
        });
    }

    // --- FITUR C: Kirim Form Join Kelas ke Supabase ---
    const joinClassForm = document.getElementById('joinClassForm');
    if (joinClassForm) {
        joinClassForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const kelasDipilih = document.getElementById('modalKelasPilihan').value;
            const namaPendaftar = document.getElementById('join_name').value.trim();
            const emailPendaftar = document.getElementById('join_email').value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailPendaftar)) {
                alert("Format email lu kurang pas nih, cik. Cek lagi ya (harus ada @ dan titik).");
                return;
            }

            try {
                // FIXED 100% SINKRON DATABASE: nama_lengkap & kelas_pilihan
                const { error } = await _supabase
                    .from('pendaftaran')
                    .insert([{ 
                        nama_lengkap: namaPendaftar, 
                        email: emailPendaftar, 
                        kelas_pilihan: kelasDipilih 
                    }]);

                if (error) {
                    alert("Akses database cloud gagal: " + error.message);
                } else {
                    alert(`Selamat ${namaPendaftar}! Lu berhasil daftar di kelas ${kelasDipilih}. Data lu aman di database cloud kita.`);
                    joinClassForm.reset();
                    bootstrap.Modal.getInstance(joinModal).hide();
                }
            } catch (err) {
                console.error("System Error: ", err);
            }
        });
    }

    // --- FITUR D: Kirim Form Rating & Review Ke Supabase ---
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const nameReview = document.getElementById('rate_name').value.trim();
            const scoreReview = document.getElementById('rate_score').value;
            const textReview = document.getElementById('rate_review').value.trim();

            try {
                const { error } = await _supabase
                    .from('rating_review')
                    .insert([{ nama: nameReview, bintang: parseInt(scoreReview), ulasan: textReview }]);

                if (error) {
                    alert("Gagal kirim review ke cloud: " + error.message);
                } else {
                    alert("Mantap cik! Makasih banyak ulasan jujurnya, langsung kesimpen di database.");
                    ratingForm.reset();
                    bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
                    loadCloudReviews();
                }
            } catch (err) {
                console.error("System Error: ", err);
            }
        });
    }

    // --- FITUR E: Dark Mode Logic Toggle ---
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', function () {
            document.body.classList.toggle('dark');
            const innerIcon = darkModeBtn.querySelector('i');
            if (document.body.classList.contains('dark')) {
                innerIcon.classList.replace('fa-moon', 'fa-sun');
                darkModeBtn.classList.replace('btn-outline-light', 'btn-outline-warning');
            } else {
                innerIcon.classList.replace('fa-sun', 'fa-moon');
                darkModeBtn.classList.replace('btn-outline-warning', 'btn-outline-light');
            }
        });
    }

    // --- FITUR F: Tombol Back to Top Smooth Scroll ---
    const topScrollBtn = document.getElementById('backToTop');
    if (topScrollBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                topScrollBtn.style.display = 'block';
                topScrollBtn.style.opacity = '1';
            } else {
                topScrollBtn.style.display = 'none';
                topScrollBtn.style.opacity = '0';
            }
        });

        topScrollBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    loadCloudReviews();
});

// ========================================================
// 3. FUNGSI GLOBAL RENDER BINTANG (DI LUAR DOM LOADED)
// ========================================================
async function loadCloudReviews() {
    const container = document.getElementById('supabaseReviewsContainer');
    if (!container) return; 

    try {
        const { data: reviews, error } = await _supabase
            .from('rating_review')
            .select('*');
            
        if (error || !reviews) {
            console.error("Gagal load review Supabase:", error);
            return;
        }

        const dynamicElements = container.querySelectorAll('.dynamic-cloud-card');
        dynamicElements.forEach(el => el.remove());

        reviews.forEach(item => {
            let bintangStars = '';
            const jumlahBintang = parseInt(item.bintang) || 5;
            for(let i = 0; i < jumlahBintang; i++) {
                bintangStars += '<i class="fas fa-star text-warning"></i>';
            }

            const cardHtml = `
                <div class="col-lg-4 col-12 dynamic-cloud-card" data-aos="fade-up">
                    <div class="p-4 bg-card rounded-4 shadow-sm h-100 d-flex flex-column card-hover position-relative">
                        <i class="fas fa-quote-left fa-3x text-info opacity-25 position-absolute" style="top: 20px; right: 20px;"></i>
                        <div class="mb-2">${bintangStars}</div>
                        <p class="text-muted lh-lg mt-2 mb-4 flex-grow-1">"${item.ulasan}"</p>
                        <div class="d-flex align-items-center border-top pt-3 mt-auto">
                            <div>
                                <h6 class="mb-0 fw-bold">${item.nama}</h6>
                                <small class="text-info fw-semibold">Verified Student</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });
    } catch(err) {
        console.log("Reviews render log error: ", err);
    }
}