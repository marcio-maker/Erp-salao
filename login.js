// Configuração básica do Three.js
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Adiciona partículas
    const particles = new THREE.BufferGeometry();
    const particleCount = 1000;

    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x7e22ce,
        transparent: true,
        opacity: 0.8
    });

    const particleMesh = new THREE.Points(particles, particleMaterial);
    scene.add(particleMesh);

    camera.position.z = 3;

    // Animação
    function animate() {
        requestAnimationFrame(animate);
        particleMesh.rotation.x += 0.0005;
        particleMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
    }

    animate();

    // Redimensionamento responsivo
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Validação do Login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    const errorElement = document.getElementById('errorMessage');

    // Simulação de validação
    if (email && password.length >= 6) {
        errorElement.classList.add('hidden');
        this.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => window.location.href = 'dashboard.html', 300);
    } else {
        errorElement.classList.remove('hidden');
        this.querySelectorAll('input').forEach(input => {
            input.classList.add('border-red-400');
            setTimeout(() => input.classList.remove('border-red-400'), 2000);
        });
    }
});
// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initThreeJS);

// Adicione após criar o particleMaterial
particleMaterial.sizeAttenuation = true;

// Adicione luzes para mais profundidade
const ambientLight = new THREE.AmbientLight(0x7e22ce, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

// Substitua o evento submit no login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Adiciona classe de fade-out
    document.body.classList.add('opacity-0', 'transition-opacity', 'duration-500');

    // Espera a animação terminar antes de redirecionar
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = 'dashboard.html';
});

function validateLogin(email, password) {
    // Simulação - em produção, isso seria uma chamada à API
    const validUsers = [
        { email: "admin@studioerp.com", password: "senha123" }
    ];

    return validUsers.some(user =>
        user.email === email && user.password === password
    );
}

const particleMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x4f46e5, // Roxo mais suave
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});