import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// --- Cinematic 3D background: stars, a glowing heart and orbiting rings. ---
const canvas = document.querySelector('#starfield');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.z = 19;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
renderer.setSize(window.innerWidth, window.innerHeight);

const starCount = window.innerWidth < 700 ? 850 : 1750;
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  const index = i * 3;
  positions[index] = (Math.random() - 0.5) * 58;
  positions[index + 1] = (Math.random() - 0.5) * 42;
  positions[index + 2] = (Math.random() - 0.5) * 42;
  const neon = Math.random();
  colors[index] = 0.55 + neon * 0.4;
  colors[index + 1] = 0.35 + neon * 0.42;
  colors[index + 2] = 0.72 + neon * 0.28;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.88, sizeAttenuation: true }));
scene.add(stars);

const heartShape = new THREE.Shape();
heartShape.moveTo(0, -0.55);
heartShape.bezierCurveTo(-1.2, 0.25, -0.75, 1.2, 0, 0.65);
heartShape.bezierCurveTo(0.75, 1.2, 1.2, 0.25, 0, -0.55);
const heart = new THREE.Mesh(new THREE.ExtrudeGeometry(heartShape, { depth: 0.22, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 }), new THREE.MeshStandardMaterial({ color: 0xff4f9a, emissive: 0x8d174f, emissiveIntensity: 0.8, metalness: 0.35, roughness: 0.28 }));
heart.position.set(7.1, 1.6, -5);
heart.scale.setScalar(0.8);
scene.add(heart);
const heartLight = new THREE.PointLight(0xff5fa2, 12, 20);
heartLight.position.set(7, 2, 0);
scene.add(heartLight);
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.018, 8, 120), new THREE.MeshBasicMaterial({ color: 0x9a7bff, transparent: true, opacity: 0.5 }));
ring.position.copy(heart.position);
ring.rotation.set(1.1, 0.35, 0.2);
scene.add(ring);

let pointerX = 0;
let pointerY = 0;
window.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / window.innerWidth - 0.5) * 0.45;
  pointerY = (event.clientY / window.innerHeight - 0.5) * 0.3;
}, { passive: true });
const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  stars.rotation.y = elapsed * 0.009 + pointerX * 0.14;
  stars.rotation.x = pointerY * 0.12;
  heart.rotation.y = Math.sin(elapsed * 0.65) * 0.32 + pointerX * 0.2;
  heart.rotation.x = Math.cos(elapsed * 0.5) * 0.12;
  heart.position.y = 1.6 + Math.sin(elapsed * 1.2) * 0.22;
  ring.rotation.z = elapsed * 0.16;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
});

// --- Start screen: the movie/game begins only when he presses Start. ---
const startScreen = document.querySelector('#start-screen');
const startButton = document.querySelector('#start-game');
startButton.addEventListener('click', () => {
  const intro = gsap.timeline({ onComplete: () => { startScreen.hidden = true; document.body.classList.add('game-started'); } });
  intro.to('.start-frame', { scale: 1.08, opacity: 0, duration: 0.55, ease: 'power3.in' })
    .to(startScreen, { opacity: 0, duration: 0.35 }, '-=0.2');
  gsap.from('.hero-eyebrow, .hero-pretitle, .hero-title span, .hero-title em, .hero-subtitle, .hero-dedication, .gold-button, .song-button', { y: 26, opacity: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out', delay: 0.45 });
});

// --- Scroll reveals and gentle movie-camera parallax. ---
gsap.utils.toArray('.reveal').forEach((element) => {
  gsap.fromTo(element, { y: 34, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
    onComplete: () => element.classList.add('is-visible'),
    scrollTrigger: { trigger: element, start: 'top 88%', once: true }
  });
});
gsap.to('.hero-photo', { scale: 1.1, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.utils.toArray('.level-card').forEach((card, index) => {
  gsap.fromTo(card, { rotateY: index % 2 ? 5 : -5, y: 34, opacity: 0 }, { rotateY: 0, y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.2)', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
});

// --- Bonus game: tap 31 hearts to unlock the birthday message. ---
const heartGrid = document.querySelector('#heart-grid');
const heartCount = document.querySelector('#heart-count');
const progressFill = document.querySelector('#progress-fill');
const scoreMessage = document.querySelector('#score-message');
const unlockMessage = document.querySelector('#unlock-message');
const toast = document.querySelector('#achievement-toast');
const collected = new Set();
let toastTimer;
function showToast(message = 'YOU FOUND A LITTLE MORE LOVE') {
  toast.querySelector('small').textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2300);
}
function burstFrom(button) {
  const rect = button.getBoundingClientRect();
  for (let i = 0; i < 7; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'heart-spark';
    spark.textContent = ['♥', '✦', '✧'][i % 3];
    spark.style.left = `${rect.left + rect.width / 2}px`;
    spark.style.top = `${rect.top + rect.height / 2}px`;
    spark.style.setProperty('--spark-x', `${(Math.random() - 0.5) * 130}px`);
    spark.style.setProperty('--spark-y', `${-35 - Math.random() * 100}px`);
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 950);
  }
}
function updateGame() {
  const count = collected.size;
  heartCount.textContent = String(count).padStart(2, '0');
  progressFill.style.width = `${(count / 31) * 100}%`;
  scoreMessage.textContent = count === 0 ? 'READY PLAYER ONE?' : count < 31 ? `${31 - count} HEART${31 - count === 1 ? '' : 'S'} LEFT TO UNLOCK` : 'ALL HEARTS COLLECTED!';
  if (count === 31) {
    unlockMessage.hidden = false;
    showToast('YOU COMPLETED THE LOVE QUEST!');
    gsap.fromTo(unlockMessage, { scale: 0.75, opacity: 0, y: 25 }, { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)' });
    burstFrom(heartGrid.lastElementChild);
  }
}
for (let i = 1; i <= 31; i += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'heart-pickup';
  button.textContent = '♥';
  button.setAttribute('aria-label', `Collect heart ${i}`);
  button.dataset.heart = String(i);
  button.addEventListener('click', () => {
    if (collected.has(i)) return;
    collected.add(i);
    button.classList.add('collected');
    button.setAttribute('aria-pressed', 'true');
    burstFrom(button);
    updateGame();
  });
  heartGrid.appendChild(button);
}
document.querySelector('#reset-hearts').addEventListener('click', () => {
  collected.clear();
  heartGrid.querySelectorAll('.heart-pickup').forEach((button) => { button.classList.remove('collected'); button.setAttribute('aria-pressed', 'false'); });
  unlockMessage.hidden = true;
  updateGame();
});
// --- The final reward: a playful animated kiss from Player 02. ---
const kissOverlay = document.querySelector('#kiss-overlay');
const kissCard = document.querySelector('#kiss-card');
const closeKissButton = document.querySelector('#close-kiss');
const continueKissButton = document.querySelector('#kiss-continue');
function openKissReward() {
  kissOverlay.hidden = false;
  kissCard.classList.remove('kiss-animate');
  // Restart the entrance animation each time the reward is opened.
  void kissCard.offsetWidth;
  kissCard.classList.add('kiss-animate');
  closeKissButton.focus();
}
function closeKissReward(goToLetter = false) {
  kissOverlay.hidden = true;
  if (goToLetter) document.querySelector('#letter').scrollIntoView({ behavior: 'smooth' });
  else document.querySelector('#claim-reward').focus();
}
document.querySelector('#claim-reward').addEventListener('click', () => {
  openKissReward();
  showToast('YOUR KISS REWARD HAS ARRIVED!');
});
closeKissButton.addEventListener('click', () => closeKissReward(false));
continueKissButton.addEventListener('click', () => closeKissReward(true));
kissOverlay.addEventListener('click', (event) => {
  if (event.target === kissOverlay) closeKissReward(false);
});

// --- The soundtrack opens on a deliberate tap (browser autoplay policy). ---
const playSongButton = document.querySelector('#play-song');
const musicOverlay = document.querySelector('#music-overlay');
const closeSongButton = document.querySelector('#close-song');
const songFrame = document.querySelector('#song-frame');
const songEmbedUrl = 'https://www.youtube-nocookie.com/embed/htgGQqD055Y?autoplay=1&rel=0';
function openSongPlayer() { musicOverlay.hidden = false; songFrame.src = songEmbedUrl; closeSongButton.focus(); }
function closeSongPlayer() { musicOverlay.hidden = true; songFrame.src = ''; playSongButton.focus(); }
playSongButton.addEventListener('click', openSongPlayer);
closeSongButton.addEventListener('click', closeSongPlayer);
musicOverlay.addEventListener('click', (event) => { if (event.target === musicOverlay) closeSongPlayer(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !musicOverlay.hidden) closeSongPlayer(); if (event.key === 'Escape' && !kissOverlay.hidden) closeKissReward(false); });
