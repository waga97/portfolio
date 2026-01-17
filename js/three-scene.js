import * as THREE from 'three';

class AvatarScene {
    constructor() {
        this.canvas = document.getElementById('avatar-canvas');
        this.fallback = document.getElementById('avatar-fallback');
        this.photoFrame = document.querySelector('.photo-frame');

        // Check support
        if (!this.isSupported()) {
            this.showFallback();
            return;
        }

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        this.isRunning = true;
        this.isJokerMode = false;

        // Store references for Joker transformation
        this.avatarParts = {};

        this.init();
    }

    isSupported() {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
        const isMobile = window.innerWidth < 768;
        return hasWebGL && !isMobile;
    }

    showFallback() {
        if (this.canvas) this.canvas.style.display = 'none';
        if (this.fallback) this.fallback.style.display = 'flex';
    }

    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.createAvatar();
        this.addEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 4;
        this.camera.position.y = 0.3;
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(2, 2, 3);
        this.scene.add(directional);
    }

    createAvatar() {
        this.avatarGroup = new THREE.Group();

        // Normal colors
        const skinColor = 0xD4A574;
        const skinDark = 0xB8956A;
        const hairColor = 0x1a1a1a;
        const shirtColor = 0x00D4FF;
        const outlineColor = 0x0a0a0a;

        // HEAD
        const headGeometry = new THREE.BoxGeometry(1.2, 1.4, 1.1);
        const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.5;
        this.addEdges(head, outlineColor);
        this.avatarGroup.add(head);
        this.avatarParts.head = head;

        // HAIR - Top
        const hairGeometry = new THREE.BoxGeometry(1.25, 0.15, 1.15);
        const hairMaterial = new THREE.MeshLambertMaterial({ color: hairColor });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.27;
        this.addEdges(hair, outlineColor);
        this.avatarGroup.add(hair);
        this.avatarParts.hairTop = hair;

        // Hair sides
        const hairSideGeometry = new THREE.BoxGeometry(0.08, 0.5, 1.0);
        const hairSideLeft = new THREE.Mesh(hairSideGeometry, hairMaterial.clone());
        hairSideLeft.position.set(-0.64, 0.95, 0);
        this.addEdges(hairSideLeft, outlineColor);
        this.avatarGroup.add(hairSideLeft);
        this.avatarParts.hairLeft = hairSideLeft;

        const hairSideRight = new THREE.Mesh(hairSideGeometry, hairMaterial.clone());
        hairSideRight.position.set(0.64, 0.95, 0);
        this.addEdges(hairSideRight, outlineColor);
        this.avatarGroup.add(hairSideRight);
        this.avatarParts.hairRight = hairSideRight;

        // EYES - white eyeballs
        const eyeballGeometry = new THREE.BoxGeometry(0.22, 0.16, 0.1);
        const eyeballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const leftEyeball = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
        leftEyeball.position.set(-0.28, 0.6, 0.54);
        this.addEdges(leftEyeball, outlineColor);
        this.avatarGroup.add(leftEyeball);

        const rightEyeball = new THREE.Mesh(eyeballGeometry, eyeballMaterial.clone());
        rightEyeball.position.set(0.28, 0.6, 0.54);
        this.addEdges(rightEyeball, outlineColor);
        this.avatarGroup.add(rightEyeball);

        // Pupils
        const pupilGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.08);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.28, 0.6, 0.6);
        this.avatarGroup.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial.clone());
        rightPupil.position.set(0.28, 0.6, 0.6);
        this.avatarGroup.add(rightPupil);

        // JOKER EYE MAKEUP - Blue diamonds (hidden by default)
        const eyeMakeupGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.05);
        const blueMakeupMaterial = new THREE.MeshBasicMaterial({ color: 0x1E90FF, visible: false });

        const leftEyeMakeup = new THREE.Mesh(eyeMakeupGeometry, blueMakeupMaterial);
        leftEyeMakeup.position.set(-0.28, 0.6, 0.52);
        leftEyeMakeup.rotation.z = 0.3;
        this.avatarGroup.add(leftEyeMakeup);
        this.avatarParts.leftEyeMakeup = leftEyeMakeup;

        const rightEyeMakeup = new THREE.Mesh(eyeMakeupGeometry, blueMakeupMaterial.clone());
        rightEyeMakeup.position.set(0.28, 0.6, 0.52);
        rightEyeMakeup.rotation.z = -0.3;
        this.avatarGroup.add(rightEyeMakeup);
        this.avatarParts.rightEyeMakeup = rightEyeMakeup;

        // Eyebrows
        const browGeometry = new THREE.BoxGeometry(0.25, 0.06, 0.08);
        const browMaterial = new THREE.MeshBasicMaterial({ color: hairColor });

        const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        leftBrow.position.set(-0.28, 0.75, 0.56);
        leftBrow.rotation.z = 0.1;
        this.avatarGroup.add(leftBrow);
        this.avatarParts.leftBrow = leftBrow;

        const rightBrow = new THREE.Mesh(browGeometry, browMaterial.clone());
        rightBrow.position.set(0.28, 0.75, 0.56);
        rightBrow.rotation.z = -0.1;
        this.avatarGroup.add(rightBrow);
        this.avatarParts.rightBrow = rightBrow;

        // Nose
        const noseGeometry = new THREE.BoxGeometry(0.15, 0.25, 0.2);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: skinDark });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.4, 0.6);
        this.addEdges(nose, outlineColor);
        this.avatarGroup.add(nose);
        this.avatarParts.nose = nose;

        // Mouth (normal)
        const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: skinDark });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 0.05, 0.56);
        this.avatarGroup.add(mouth);
        this.avatarParts.mouth = mouth;

        // JOKER SMILE - Big red smile (hidden by default)
        const smileGroup = new THREE.Group();

        // Main smile
        const smileGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.08);
        const redMaterial = new THREE.MeshBasicMaterial({ color: 0xCC0000, visible: false });
        const smile = new THREE.Mesh(smileGeometry, redMaterial);
        smile.position.set(0, 0.02, 0.58);
        smileGroup.add(smile);

        // Smile corners going up
        const smileCornerGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.08);
        const leftSmileCorner = new THREE.Mesh(smileCornerGeometry, redMaterial.clone());
        leftSmileCorner.position.set(-0.35, 0.12, 0.58);
        leftSmileCorner.rotation.z = 0.5;
        smileGroup.add(leftSmileCorner);

        const rightSmileCorner = new THREE.Mesh(smileCornerGeometry, redMaterial.clone());
        rightSmileCorner.position.set(0.35, 0.12, 0.58);
        rightSmileCorner.rotation.z = -0.5;
        smileGroup.add(rightSmileCorner);

        this.avatarGroup.add(smileGroup);
        this.avatarParts.jokerSmile = smileGroup;

        // MOUSTACHE
        const moustacheGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.1);
        const moustacheMaterial = new THREE.MeshLambertMaterial({ color: hairColor });
        const moustache = new THREE.Mesh(moustacheGeometry, moustacheMaterial);
        moustache.position.set(0, 0.15, 0.58);
        this.addEdges(moustache, outlineColor);
        this.avatarGroup.add(moustache);
        this.avatarParts.moustache = moustache;

        const moustacheSideGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.08);
        const moustacheLeft = new THREE.Mesh(moustacheSideGeometry, moustacheMaterial.clone());
        moustacheLeft.position.set(-0.22, 0.1, 0.56);
        moustacheLeft.rotation.z = 0.3;
        this.avatarGroup.add(moustacheLeft);
        this.avatarParts.moustacheLeft = moustacheLeft;

        const moustacheRight = new THREE.Mesh(moustacheSideGeometry, moustacheMaterial.clone());
        moustacheRight.position.set(0.22, 0.1, 0.56);
        moustacheRight.rotation.z = -0.3;
        this.avatarGroup.add(moustacheRight);
        this.avatarParts.moustacheRight = moustacheRight;

        // Ears
        const earGeometry = new THREE.BoxGeometry(0.12, 0.25, 0.2);
        const earMaterial = new THREE.MeshLambertMaterial({ color: skinColor });

        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.66, 0.5, 0);
        this.addEdges(leftEar, outlineColor);
        this.avatarGroup.add(leftEar);
        this.avatarParts.leftEar = leftEar;

        const rightEar = new THREE.Mesh(earGeometry, earMaterial.clone());
        rightEar.position.set(0.66, 0.5, 0);
        this.addEdges(rightEar, outlineColor);
        this.avatarGroup.add(rightEar);
        this.avatarParts.rightEar = rightEar;

        // NECK
        const neckGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        const neckMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = -0.4;
        this.addEdges(neck, outlineColor);
        this.avatarGroup.add(neck);
        this.avatarParts.neck = neck;

        // SHOULDERS / SHIRT
        const shoulderGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.8);
        const shirtMaterial = new THREE.MeshLambertMaterial({ color: shirtColor });
        const shoulders = new THREE.Mesh(shoulderGeometry, shirtMaterial);
        shoulders.position.y = -0.9;
        this.addEdges(shoulders, outlineColor);
        this.avatarGroup.add(shoulders);
        this.avatarParts.shoulders = shoulders;

        // Collar
        const collarGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.55);
        const collarMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        collar.position.set(0, -0.55, 0.2);
        this.addEdges(collar, outlineColor);
        this.avatarGroup.add(collar);

        this.avatarGroup.position.y = 0;
        this.scene.add(this.avatarGroup);
    }

    addEdges(mesh, color) {
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);
    }

    // JOKER TRANSFORMATION
    activateJokerMode() {
        if (this.isJokerMode) return;
        this.isJokerMode = true;

        const jokerGreen = 0x228B22;
        const jokerWhite = 0xf5f5f5;
        const jokerRed = 0xCC0000;
        const jokerBlue = 0x1E90FF;
        const jokerPurple = 0x800080;

        // Hair -> Green
        this.avatarParts.hairTop.material.color.setHex(jokerGreen);
        this.avatarParts.hairLeft.material.color.setHex(jokerGreen);
        this.avatarParts.hairRight.material.color.setHex(jokerGreen);

        // Face -> White
        this.avatarParts.head.material.color.setHex(jokerWhite);
        this.avatarParts.leftEar.material.color.setHex(jokerWhite);
        this.avatarParts.rightEar.material.color.setHex(jokerWhite);
        this.avatarParts.neck.material.color.setHex(jokerWhite);

        // Nose -> Red
        this.avatarParts.nose.material.color.setHex(jokerRed);

        // Eyebrows -> Red
        this.avatarParts.leftBrow.material.color.setHex(jokerRed);
        this.avatarParts.rightBrow.material.color.setHex(jokerRed);

        // Show blue eye makeup
        this.avatarParts.leftEyeMakeup.material.visible = true;
        this.avatarParts.leftEyeMakeup.material.color.setHex(jokerBlue);
        this.avatarParts.rightEyeMakeup.material.visible = true;
        this.avatarParts.rightEyeMakeup.material.color.setHex(jokerBlue);

        // Hide normal mouth
        this.avatarParts.mouth.material.visible = false;

        // Show Joker smile
        this.avatarParts.jokerSmile.children.forEach(child => {
            child.material.visible = true;
        });

        // Hide moustache (Joker doesn't have facial hair)
        this.avatarParts.moustache.visible = false;
        this.avatarParts.moustacheLeft.visible = false;
        this.avatarParts.moustacheRight.visible = false;

        // Shirt -> Purple
        this.avatarParts.shoulders.material.color.setHex(jokerPurple);
    }

    deactivateJokerMode() {
        if (!this.isJokerMode) return;
        this.isJokerMode = false;

        const skinColor = 0xD4A574;
        const skinDark = 0xB8956A;
        const hairColor = 0x1a1a1a;
        const shirtColor = 0x00D4FF;

        // Hair -> Black
        this.avatarParts.hairTop.material.color.setHex(hairColor);
        this.avatarParts.hairLeft.material.color.setHex(hairColor);
        this.avatarParts.hairRight.material.color.setHex(hairColor);

        // Face -> Skin
        this.avatarParts.head.material.color.setHex(skinColor);
        this.avatarParts.leftEar.material.color.setHex(skinColor);
        this.avatarParts.rightEar.material.color.setHex(skinColor);
        this.avatarParts.neck.material.color.setHex(skinColor);

        // Nose -> Skin dark
        this.avatarParts.nose.material.color.setHex(skinDark);

        // Eyebrows -> Black
        this.avatarParts.leftBrow.material.color.setHex(hairColor);
        this.avatarParts.rightBrow.material.color.setHex(hairColor);

        // Hide eye makeup
        this.avatarParts.leftEyeMakeup.material.visible = false;
        this.avatarParts.rightEyeMakeup.material.visible = false;

        // Show normal mouth
        this.avatarParts.mouth.material.visible = true;

        // Hide Joker smile
        this.avatarParts.jokerSmile.children.forEach(child => {
            child.material.visible = false;
        });

        // Show moustache
        this.avatarParts.moustache.visible = true;
        this.avatarParts.moustacheLeft.visible = true;
        this.avatarParts.moustacheRight.visible = true;

        // Shirt -> Blue
        this.avatarParts.shoulders.material.color.setHex(shirtColor);
    }

    addEventListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));

        // Joker mode on photo frame hover
        if (this.photoFrame) {
            this.photoFrame.addEventListener('mouseenter', () => {
                this.activateJokerMode();
            });
            this.photoFrame.addEventListener('mouseleave', () => {
                this.deactivateJokerMode();
            });
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        if (this.canvas.offsetWidth === 0) return;

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    onVisibilityChange() {
        if (document.hidden) {
            this.isRunning = false;
        } else {
            this.isRunning = true;
            this.animate();
        }
    }

    onCanvasClick() {
        this.nodAnimation = true;
        this.nodStartTime = this.clock.getElapsedTime();
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(this.animate.bind(this));

        const elapsed = this.clock.getElapsedTime();

        const maxRotationY = 0.8;
        const maxRotationX = 0.4;

        this.targetRotation.y = this.mouse.x * maxRotationY;
        this.targetRotation.x = -this.mouse.y * maxRotationX;

        const easing = 0.15;
        this.avatarGroup.rotation.y += (this.targetRotation.y - this.avatarGroup.rotation.y) * easing;
        this.avatarGroup.rotation.x += (this.targetRotation.x - this.avatarGroup.rotation.x) * easing;

        this.avatarGroup.position.y = Math.sin(elapsed * 0.8) * 0.05;

        const breathScale = 1 + Math.sin(elapsed * 1.2) * 0.01;
        this.avatarGroup.scale.set(breathScale, breathScale, breathScale);

        if (this.nodAnimation) {
            const nodElapsed = elapsed - this.nodStartTime;
            if (nodElapsed < 0.5) {
                const nodAmount = Math.sin(nodElapsed * Math.PI * 4) * 0.15;
                this.avatarGroup.rotation.x += nodAmount;
            } else {
                this.nodAnimation = false;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AvatarScene();
});
