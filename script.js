document.addEventListener('DOMContentLoaded', function () {
    // =========================================================================
    // KONFIGURASI SUPABASE (Kredensial Project ID Berdasarkan Gambar)
    // =========================================================================
    const SUPABASE_URL = "https://wlhtnlcdvmnqdbimkqqx.supabase.co"; 
    const SUPABASE_KEY = "sb_publishable__CwCHKulvoa5mMvgN8EoPw_Hk3ZZ1Yl"; // Ganti pakai token di gambar image_2
    
    // Inisialisasi client Supabase secara global
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Inisialisasi AOS (Animate On Scroll) Biar Smooth
    AOS.init({
        once: true, // Animasi cuma jalan sekali pas discroll turun
        offset: 100, // Mulai animasi pas 100px sebelum elemen keliatan
        duration: 800
    });

    // 3. Dark Mode Toggle
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

    // 4. Back to Top Button
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

    // =========================================================================
    // FITUR TAMBAHAN: JOIN CLASS & DATA INTEGRATION KE SUPABASE DATABASE
    // =========================================================================

    // A. Otomatisasi Input Nama Kelas di Modal saat klik "Join Kelas"
    const joinButtons = document.querySelectorAll('.btn-join-kelas');
    const modalKelasInput = document.getElementById('modalKelasPilihan');

    joinButtons.forEach(button => {
        button.addEventListener('click', function() {
            const namaKelas = this.getAttribute('data-kelas');
            if (modalKelasInput) {
                modalKelasInput.value = namaKelas;
            }
        });
    });

    // Reset isi form secara otomatis pas modal pendaftaran tertutup / dibatalkan
    const joinClassForm = document.getElementById('joinClassForm');
    const joinModalEl = document.getElementById('joinModal');
    if (joinModalEl) {
        joinModalEl.addEventListener('hidden.bs.modal', function () {
            if (joinClassForm) joinClassForm.reset();
        });
    }

    // B. Kirim Data Form Join Kelas ke Supabase
    if (joinClassForm) {
        joinClassForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btnSubmit = document.getElementById('btnSubmitJoin');
            btnSubmit.innerText = "Sabar, lagi ngirim...";
            btnSubmit.disabled = true;

            const kelasPilihan = document.getElementById('modalKelasPilihan').value;
            const namaLengkap = document.getElementById('join_name').value.trim();
            const email = document.getElementById('join_email').value.trim();

            // Insert ke tabel 'pendaftaran' di Supabase
            const { data, error } = await supabase
                .from('pendaftaran')
                .insert([
                    { nama_lengkap: namaLengkap, email: email, kelas_pilihan: kelasPilihan }
                ]);

            if (error) {
                console.error("Supabase Error:", error);
                alert("Aduh, gagal nyambung ke database Supabase. Coba cek konfigurasi RLS tabel pendaftaran lu.");
            } else {
                alert(`Mantap! Lu sukses join kelas: ${kelasPilihan}. Data pendaftaran lu aman di database!`);
                joinClassForm.reset();
                
                // Tutup modal secara otomatis lewat javascript bootstrap native
                const modalInstance = bootstrap.Modal.getInstance(joinModalEl);
                if(modalInstance) modalInstance.hide();
            }

            btnSubmit.innerText = "Daftar Sekarang";
            btnSubmit.disabled = false;
        });
    }

    // =========================================================================
    // FITUR TAMBAHAN: INPUT & RENDER RATING REVIEW DARI SUPABASE
    // =========================================================================

    // Reset isi form secara otomatis pas modal rating tertutup / dibatalkan
    const ratingForm = document.getElementById('ratingForm');
    const ratingModalEl = document.getElementById('ratingModal');
    if (ratingModalEl) {
        ratingModalEl.addEventListener('hidden.bs.modal', function () {
            if (ratingForm) ratingForm.reset();
        });
    }

    // C. Kirim Data Form Rating ke Supabase
    if (ratingForm) {
        ratingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const btnSubmit = document.getElementById('btnSubmitRating');
            btnSubmit.innerText = "Mengirim...";
            btnSubmit.disabled = true;

            const namaUser = document.getElementById('rate_name').value.trim();
            const skorRating = parseInt(document.getElementById('rate_score').value);
            const ulasanUser = document.getElementById('rate_review').value.trim();

            // Insert ke tabel 'rating_review' di Supabase
            const { data, error } = await supabase
                .from('rating_review')
                .insert([
                    { nama: namaUser, rating: skorRating, ulasan: ulasanUser }
                ]);

            if (error) {
                console.error("Supabase Error:", error);
                alert("Gagal ngirim rating. Cek setelan permission RLS tabel rating_review di dashboard Supabase lu.");
            } else {
                alert(`Thank you ${namaUser}! Review jujur bintang ${skorRating} lu udah kesimpen di database.`);
                ratingForm.reset();
                
                // Tutup modal rating
                const modalInstance = bootstrap.Modal.getInstance(ratingModalEl);
                if(modalInstance) modalInstance.hide();
                
                // Refresh data review di halaman tanpa reload penuh
                fetchReviews();
            }

            btnSubmit.innerText = "Kirim Rating";
            btnSubmit.disabled = false;
        });
    }

    // D. Fungsi Ambil Data Review dari Supabase dan Tampilkan ke Section Testimonials
    async function fetchReviews() {
        const container = document.getElementById('supabaseReviewsContainer');
        if (!container) return;

        // Tarik 3 review terbaru dari database
        const { data: reviews, error } = await supabase
            .from('rating_review')
            .select('*')
            .order('id', { ascending: false })
            .limit(3);

        if (error) {
            console.error("Error ngambil data review:", error);
            return; 
        }

        // Kalau ada data baru di database, render di bawah review statis bawaan awal
        if (reviews && reviews.length > 0) {
            // Hapus review dinamis yang lama (jika ada) biar gak double pas di-refresh
            const oldDynamicReviews = container.querySelectorAll('.dynamic-review');
            oldDynamicReviews.forEach(el => el.remove());

            reviews.forEach((item, index) => {
                // Generate bintang emas sesuai skor angka rating-nya
                let starHtml = "";
                for (let i = 1; i <= 5; i++) {
                    if (i <= item.rating) {
                        starHtml += '<i class="fas fa-star text-warning me-1"></i>';
                    } else {
                        starHtml += '<i class="far fa-star text-warning me-1"></i>';
                    }
                }

                // Susun element card baru murni nama dan ulasan tanpa julukan teks apa pun bawahnya
                const reviewCard = document.createElement('div');
                reviewCard.className = "col-lg-4 col-12 dynamic-review";
                reviewCard.setAttribute('data-aos', 'fade-up');
                reviewCard.setAttribute('data-aos-delay', `${(index + 4) * 100}`);

                reviewCard.innerHTML = `
                    <div class="p-4 bg-card rounded-4 shadow-sm h-100 d-flex flex-column card-hover position-relative">
                        <div class="mb-2">${starHtml}</div>
                        <p class="text-muted lh-lg mt-2 mb-4 flex-grow-1">"${item.ulasan}"</p>
                        <div class="d-flex align-items-center border-top pt-3 mt-auto">
                            <div>
                                <h6 class="mb-0 fw-bold">${item.nama}</h6>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(reviewCard);
            });
            
            // Re-inisialisasi ulang AOS biar card baru dapet efek animasi smooth
            if(window.AOS) {
                AOS.refresh();
            }
        }
    }

    // Jalankan fungsi fetch pas halaman pertama kali kelar dimuat
    fetchReviews();
});