document.addEventListener('DOMContentLoaded', function () {
    // 1. Inisialisasi AOS (Animate On Scroll) Biar Smooth
    AOS.init({
        once: true, // Animasi cuma jalan sekali pas discroll turun
        offset: 100, // Mulai animasi pas 100px sebelum elemen keliatan
        duration: 800
    });

    // 2. Validasi Form Wajib Pake JS
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Stop reload otomatis

            const nameValue = document.getElementById('name').value.trim();
            const emailValue = document.getElementById('email').value.trim();
            const messageValue = document.getElementById('message').value.trim();

            if (nameValue === "" || emailValue === "" || messageValue === "") {
                alert("Ups! Kolom Nama, Email, sama Pesan gak boleh kosong ya, wajib diisi semua.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                alert("Format email lu kurang pas nih. Cek lagi ya (contohnya harus ada @ dan titik).");
                return;
            }

            // Kalo sukses lolos validasi
            alert(`Siaapp! Makasih banyak ${nameValue}. Pesan lu udah masuk ke database kita. Tungguin balasan dari admin ya!`);
            contactForm.reset(); 
        });
    }

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
});