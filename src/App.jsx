import { useRef, useState, useEffect } from 'react';
import './App.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import lottie from 'lottie-web';
import loadingUrl from '/loading.json?url';
import gsap from 'gsap';
import { clamp } from 'three/src/math/MathUtils.js';






// ===============================================
// 1. 핫스팟 데이터 (THREE.Vector3 위치)
// ===============================================

const hotspotsData = [
  // 3D 좌표는 이전 프로젝트에서 가져온 데이터를 사용했습니다.
  { id: 'hotspot-1-1', level2Id: '1-1', label: '제어반', position: new THREE.Vector3(1.722459943, 2.741464162, 1.826513382) },
  { id: 'hotspot-1-2', level2Id: '1-2', label: '유량계', position: new THREE.Vector3(2.352759922, 2.940494464, 1.268134725) },
  { id: 'hotspot-1-3', level2Id: '1-3', label: '정류기', position: new THREE.Vector3(3.338999889, 2.791274238, 1.341697484) },
  { id: 'hotspot-2-1', level2Id: '2-1', label: '전해조', position: new THREE.Vector3(2.508639917, 1.02077155, 1.232338784) },
  { id: 'hotspot-2-2', level2Id: '2-2', label: '펌프', position: new THREE.Vector3(0.2125399929, 0.7042710693, 0.5778873445) },
  { id: 'hotspot-3-1', level2Id: '3-1', label: '입자성 오염물질 처리장치', position: new THREE.Vector3(-2.619579913, 0.7285911062, 0.1746977963) },
  //{ id: 'hotspot-3-1', level2Id: '3-1', label: '원점', position: new THREE.Vector3(0, 0, 0) },

];

const targetViews = {
  // level2Id: { radius: Number, phi: Number (deg), theta: Number (deg) }
  '1-1': { radius: 0.527, phi: 42.51, theta: 43.21 }, // 제어반 예시
  '1-2': { radius: 0.429, phi: 42.26, theta: 61.74 }, // 유량계 예시
  '1-3': { radius: 0.584, phi: 52.21, theta: 68.22 }, // 정류기 예시
  '2-1': { radius: 0.554, phi: 69.97, theta: 63.73 }, // 전해조 예시
  '2-2': { radius: 0.452, phi: 41.01, theta: 19.39 }, // 펌프 예시
  '3-1': { radius: 0.647, phi: 66.58, theta: 1.36 }, // 원점 예시
};

const targetDetail = {
  // 제어반 예시
  '1-1': {
    detail: '처리장치 전체의 상황을 모니터링하고 조절하는\n부분으로 기본적으로 장치에 유입, 배출되는 유량과\n전해조에 인가되고 있는 전압, 전류를 확인할 수 있다.\n\n또한 센서를 추가설치하고 IoT 시스템을 이용하여\n유입수/처리수의 온도, pH, 전기전도도 및 현장 영상\n등을 확인할 수 있다.',
  },
  '1-2': {
    detail: '처리장치로 유입되는 공정수 유량을 측정하여\n전체공정을 안정적으로 운전하는 역할을 수행한다.',
  },
  '1-3': {
    detail: '교류전기를 직류전기로 변환하는 장치이다.\n\n전해조가 안정적인 전기화학적 반응을 일으키기 위해\n필요한 일정한 직류 전기를 공급하는 역할을 한다.',
  },
  '2-1': {
    detail: '전해조란 전기 에너지를 이용해 전기화학반응을 일으키는\n장치이다.\n\n이온, 분자 형태로 존재하여 응집,여과로 제거가 불가능한 용존성 오염물질을 전기화학적 반응을 통해 효과적으로 처리할 수 있다. 전해조는 사용목적에 따라 전기화학적 산화반응이나 환원반응을 일으키도록 설계할 수 있다.\n\nNE Series의 전해조는 산화반응을 이용한 직접산화(0차 반응)와 간접산화(1,2차 반응)를 일으켜 강한 산화물질을 만들어내며, 이를 통해 수중 총유기탄소와 암모니아성 질소 등의 오염물질을\n분해/제거한다.\n\n당사의 전해조는 모듈형 설계로 전극개수와 처리용량 조절이\n용이하고 생산성을 극대화하였으며, 폐쇄형 구조를 채택하여\n배가스로 인한 부스바 부식문제에 대응하였다.',
    src: '/images/img-전해조.png',
  },
  '2-2': {
    detail: '처리장치로 공정수나 폐수를 유입시키는 역할을 수행한다.',
  },
  '3-1': {
    detail: '폐수에 녹지 않고 입자형태로 떠다니는 오염물질들을 제거하는 장치이다. 대개 화학약품을 통해 작은 입자들을 큰 입자로 응집한 후에 침전 혹은 부상하여 필터 등으로 여과하는 방식을 사용한다.\n\n입자성 오염물질 처리장치에는 침전, 용존공기부상(DAF),\n여과장치 등이 있다.',
    src: '/images/img-입자성 오염물질 처리장치.png',
  },
};

const MODEL_URL = '/NeoEco_Test.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL2 = '/NeoEco_Water2.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL3 = '/NeoEco_PipeWater.glb'; // 🚨 3D 모델 경로 확인 🚨

const MODEL_URL4 = '/Stage1.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL5 = '/Stage2.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL6 = '/Stage3.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL7 = '/Stage4.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL8 = '/Stage5.glb'; // 🚨 3D 모델 경로 확인 🚨

const MODEL_URL9 = '/Solids.glb'; // 🚨 3D 모델 경로 확인 🚨
const MODEL_URL10 = '/Stage1_1.glb'; // 🚨 3D 모델 경로 확인 🚨




function App() {
  // ------------------------------------
  // 1. STATE & REFS
  // ------------------------------------
  const loaderRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // THREE.js Core Refs
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const modelRef = useRef(null);
  const animationMixerRef = useRef(null);
  const animationMixersRef = useRef([]);

  const clipRef = useRef(null);
  const actionRef = useRef(null);

  const titleContainerRef = useRef(null); // title-container Ref
  const rightPanelRef = useRef(null);      // right-panel Ref
  const bottomContainerRef = useRef(null);

  const main_offsetX = -0.1;
  const main_offsetY = -0.2;
  const detail_offsetX = 0.1;
  const detail_offsetY = -0;

  const isLoadingRef = useRef(false);

  const [isMobileRatio, setIsMobileRatio] = useState(false);

  const RATIO = [
    { mode: "pc", width: 1920, height: 1080 },
    { mode: "tablet", width: 0, height: 0 },
    { mode: "tablet_portrait", width: 0, height: 0 },
    { mode: "mobile", width: 0, height: 0 },
  ];

  function findClosestRatio(target) {
    return RATIO.reduce((closest, entry) =>
      Math.abs(entry.width / entry.height - target) <
        Math.abs(closest.width / closest.height - target)
        ? entry
        : closest
    );
  }

  const modeRef = useRef(findClosestRatio(window.innerWidth / window.innerHeight));
  const ratioRef = useRef(0.01);

  const [mode, setMode] = useState(() => modeRef.current);
  const [ratio, setRatio] = useState(() => ratioRef.current);

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const [showCenterContainer, setShowCenterContainer] = useState(true);

  const lottieInstanceRef = useRef(null); 
  // 🌟 Lottie 애니메이션을 담을 DOM 요소의 Ref 🌟
  const lottieContainerRef = useRef(null);


  const hideCenterContainer = () => {
    if (showCenterContainer) { // 이미 숨겨진 상태가 아니면 실행
      setShowCenterContainer(false);
    }
  };

  // ⭐️ 추가: selectedHotspot의 최신 값을 유지하기 위한 Ref
  const selectedHotspotRef = useRef(selectedHotspot);

  // ⭐️ 추가: selectedHotspot State가 변경될 때마다 Ref를 업데이트
  useEffect(() => {
    selectedHotspotRef.current = selectedHotspot;
  }, [selectedHotspot]);

  function animateUIForMainView(duration = 1.2) {
    const titleEl = titleContainerRef.current;
    const rightPanelEl = rightPanelRef.current;
    const bottomEL = bottomContainerRef.current;

    bottomEL.style.display = 'flex';
    if (titleEl) {
      // title-container를 다시 나타나게
      titleEl.style.pointerEvents = 'auto';
      gsap.to(titleEl, {
        duration: duration,
        x: '0%',
        autoAlpha: 1,
        ease: 'power2.inOut',
      });
    }
    if (rightPanelEl) {
      // right-panel을 오른쪽으로 사라지게
      rightPanelEl.style.pointerEvents = 'none';
      gsap.to(rightPanelEl, {
        duration: duration * 0.8,
        x: '250%',
        ease: 'power2.inOut'
      });
    }
    if (bottomEL) {
      // 원래 위치 (y: 0%)로 올라오게 합니다.
      gsap.to(
        bottomEL,
        {
          duration: duration,
          y: '100%', // 종료 상태: 원래 위치
          ease: 'power2.inOut'
        }
      );
    }
  }


  const handleDetailViewClose = (duration = 1.2) => {

    // 1. UI 애니메이션 복귀 (Title 나타나고, Panel 사라지게)
    animateUIForMainView(duration);

    // 2. 모델 뷰 오프셋 복귀 (카메라 위치는 그대로, 캔버스 뷰만 복귀)
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (controls && camera && renderer) {

      // 💥 모델 오프셋 복귀 애니메이션 💥
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mainViewOffsetX = width * main_offsetX;
      const mainViewOffsetY = height * main_offsetY;

      const offsetState = {
        offsetX: camera.view.enabled ? camera.view.offsetX : 0,
        offsetY: camera.view.enabled ? camera.view.offsetY : 0
      };

      gsap.to(offsetState, {
        duration: duration,
        offsetX: mainViewOffsetX,
        offsetY: mainViewOffsetY,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.setViewOffset(
            width,
            height,
            offsetState.offsetX,
            offsetState.offsetY,
            width,
            height
          );
          camera.updateProjectionMatrix();
          // updateHotspots(); // animate 루프에서 호출됨
        },
        onComplete: () => {
          // 오프셋 복귀 완료 후, 카메라를 메인 뷰 위치(level2Id: '3-1')로 애니메이션
        }
      });

      //회전 OFF
      gsap.to(controls.target, {
        duration: duration,
        x: 0,
        y: 0,
        z: 0,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });
      //회전 OFF END

      const originView = targetViews['3-1'];
      if (originView) {
        const phiRad = THREE.MathUtils.degToRad(originView.phi);
        const thetaRad = THREE.MathUtils.degToRad(originView.theta);

        const finalSpherical = new THREE.Spherical(
          originView.radius + 0.35, // 줌 레벨 조정
          phiRad,
          thetaRad
        );

        const newCameraPosition = new THREE.Vector3().setFromSpherical(finalSpherical);

        gsap.to(camera.position, {
          duration: duration,
          x: newCameraPosition.x,
          y: newCameraPosition.y,
          z: newCameraPosition.z,
          ease: 'power2.inOut',
          onUpdate: () => controls.update(),
          onComplete: () => {
            // 모든 애니메이션 완료 후 Controls 활성화
            controls.enabled = true;
            setIsDetailView(false);
            setSelectedHotspot(null); // ⭐️ 선택된 핫스팟 해제
          }
        });
      } else {
        // 메인 뷰 정보가 없으면 Controls만 활성화
        controls.enabled = true;
        setIsDetailView(false);
        setSelectedHotspot(null); // ⭐️ 선택된 핫스팟 해제
      }

    }

    // 3. State 업데이트

  };


  // ------------------------------------
  // 2. LOADER HIDE FUNCTION
  // ------------------------------------
  const hideLoader = () => {

    if (lottieInstanceRef.current) {
        lottieInstanceRef.current.destroy();
        lottieInstanceRef.current = null;
    }

    setIsLoading(false);
    if (loaderRef.current) {
      loaderRef.current.style.opacity = 0;
      setTimeout(() => {
        if (loaderRef.current) {
          loaderRef.current.style.display = 'none';
        }
      }, 400);
    }
  };


  // ------------------------------------
  // 3. THREE.JS CORE LOGIC (useEffect)
  // ------------------------------------
  useEffect(() => {
    let animationFrameId;
    let hotspots = []; // 핫스팟 배열을 useEffect 클로저 내부에 정의합니다.

    // ----------------------------------------------------
    // ⭐️ 핫스팟 위치 업데이트 함수 ⭐️ (Ref 사용하여 최신 값 참조)
    // ----------------------------------------------------
    function updateHotspots() {
      if (!modelRef.current || !hotspots.length || !cameraRef.current) return;

      // ⭐️ 수정: State 대신 Ref에서 최신 값을 읽어옵니다. ⭐️
      const selectedId = selectedHotspotRef.current?.level2Id;

      cameraRef.current.updateMatrixWorld();
      const tempVector = new THREE.Vector3();

      hotspots.forEach(hotspot => {
        if (hotspot.element) {
          // modelRef가 존재할 때만 월드 매트릭스 업데이트
          modelRef.current.updateWorldMatrix(true, false);

          // 3D 로컬 좌표를 월드 좌표로 변환
          tempVector.copy(hotspot.position).applyMatrix4(modelRef.current.matrixWorld);

          // 월드 좌표를 2D 스크린 좌표로 변환
          tempVector.project(cameraRef.current);

          const x = (tempVector.x * 0.5 + 0.5) * 100;
          const y = (tempVector.y * -0.5 + 0.5) * 100;

          hotspot.element.style.left = `${x}%`;
          hotspot.element.style.top = `${y}%`;

          if (hotspot.level2Id === selectedId) {
            hotspot.element.classList.add('active');
          } else {
            if (!selectedId) {
              hotspot.element.classList.remove('active');
            }

            if (hotspot.level2Id !== selectedId) {
              if (hotspot.element.classList.contains('active') && hotspot.level2Id !== selectedId) {
                hotspot.element.classList.remove('active');
              }
            }
          }
        }
      });
    }

    // 🌟 Lottie 로드 및 초기화 함수 🌟
    function initLottie() {
      if (!lottieContainerRef.current || lottieInstanceRef.current) {
        return;
      }

      // lottie.loadAnimation 호출
      // path: '/loading.json?url'로 가져온 URL을 사용 (Vite public 폴더 접근)
      lottieInstanceRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current, // 애니메이션을 표시할 DOM 요소
        renderer: 'svg', // 렌더러 타입 (svg, canvas, html)
        loop: true,
        autoplay: true,
        path: loadingUrl // 🚨 URL 경로를 지정합니다. 
      });

    }



    function animateViewOffset(targetOffsetX, targetOffsetY, duration = 1.0) {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      if (!camera || !renderer) return;

      const { width, height } = renderer.getSize(new THREE.Vector2());

      const currentOffsetX = camera.view.enabled ? camera.view.offsetX : 0;
      const currentOffsetY = camera.view.enabled ? camera.view.offsetY : 0;

      const offsetState = {
        offsetX: currentOffsetX,
        offsetY: currentOffsetY
      };

      gsap.to(offsetState, {
        duration: duration,
        offsetX: targetOffsetX,
        offsetY: targetOffsetY,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.setViewOffset(
            width,
            height,
            offsetState.offsetX,
            offsetState.offsetY,
            width,
            height
          );
          camera.updateProjectionMatrix();
          updateHotspots();
        }
      });
    }

    // ----------------------------------------------------
    // ⭐️ 모델을 왼쪽으로 옮기는 함수 ⭐️ (사용자 요청 함수 1)
    // ----------------------------------------------------
    function animateModelLeftShift(duration = 1.5) {
      const targetOffsetX = window.innerWidth * detail_offsetX;
      const targetOffsetY = window.innerHeight * detail_offsetY;
      const bottomEL = bottomContainerRef.current;
      animateViewOffset(targetOffsetX, targetOffsetY, duration);


    }

    function animateUIForDetailView(duration = 1.2) {
      const titleEl = titleContainerRef.current;
      const rightPanelEl = rightPanelRef.current;
      const bottomEL = bottomContainerRef.current;


      bottomEL.style.display = 'flex';
      if (titleEl) {
        gsap.to(titleEl, {
          duration: duration * 0.8,
          x: '-100%',
          autoAlpha: 0,
          ease: 'power2.inOut',
          onComplete: () => {
            titleEl.style.pointerEvents = 'none';
          }
        });
      }
      if (rightPanelEl) {
        rightPanelEl.style.pointerEvents = 'auto';
        gsap.to(rightPanelEl, {
          duration: duration,
          x: '0%',
          ease: 'power2.inOut'
        });
      }
      if (bottomEL) {
        gsap.to(
          bottomEL,
          {
            duration: duration,
            y: '0%',
            ease: 'power2.inOut'
          }
        );
      }
    }

    //회전 OFF
    function animateToHotspot(targetPosition) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const model = modelRef.current;

      if (!camera || !controls || !model) return;

      const duration = 1.2;

      controls.enabled = false;

      const worldTarget = new THREE.Vector3().copy(targetPosition).applyMatrix4(model.matrixWorld);

      const currentToCamera = new THREE.Vector3().subVectors(camera.position, controls.target);

      const newControlsTarget = worldTarget;

      const targetZoomDistance = 0.5;

      const newCameraPosition = new THREE.Vector3()
        .copy(newControlsTarget)
        .add(currentToCamera.normalize().multiplyScalar(targetZoomDistance));


      gsap.to(controls.target, {
        duration: duration,
        x: newControlsTarget.x,
        y: newControlsTarget.y,
        z: newControlsTarget.z,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      gsap.to(camera.position, {
        duration: duration,
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        ease: 'power2.inOut',
        onUpdate: () => {
          controls.update();
        },
        onComplete: () => {
          controls.update(); 
          controls.enabled = true;
        }
      });

      animateModelLeftShift(duration);
    }
    //회전 OFF END


    // ----------------------------------------------------
    // ⭐️ 이벤트 핸들러 ⭐️
    // ----------------------------------------------------
    function handleCameraChange() {
      updateHotspots();

      const camera = cameraRef.current;
      const controls = controlsRef.current;

      if (camera && controls) {
        const vector = new THREE.Vector3().subVectors(camera.position, controls.target);
        const spherical = new THREE.Spherical().setFromVector3(vector);

        // console.log(
        //   `%c[사용자 조작 시 로그]`,
        //   'color: #388E3C; font-weight: bold;',
        //   `반지름(줌): ${spherical.radius.toFixed(3)}, 수직각(phi): ${THREE.MathUtils.radToDeg(spherical.phi).toFixed(2)}°, 수평각(theta): ${THREE.MathUtils.radToDeg(spherical.theta).toFixed(2)}°`
        // );
      }
    }

    function handleHotspotClick(level2Id) {
      //console.log(`Hotspot clicked: ${level2Id}`);

      const hotspotData = hotspotsData.find(h => h.level2Id === level2Id);

      if (hotspotData) {
        hotspots.forEach(h => h.element?.classList.remove('active')); // 👈 이 코드를 유지합니다.

        animateToHotspot(hotspotData.position);

        if (controlsRef.current) {
          //controlsRef.current.enabled = false; // Controls 비활성화
        }

        animateUIForDetailView(1.2); 
        setIsDetailView(true); 
        setSelectedHotspot(hotspotData); 

      } else {
        //console.warn(`Error: targetViews에 level2Id '${level2Id}'에 대한 데이터가 없습니다.`);
      }
    }

    // ----------------------------------------------------
    // ⭐️ showHotspotLabel(id) 함수 ⭐️ 
    // ----------------------------------------------------
    function showHotspotLabel(id) {
      // 마우스 오버 시 라벨을 표시합니다.
      const target = hotspots.find(h => h.id === id);
      if (target && target.element) {
        target.element.classList.add('active');
      }
    }

    // ----------------------------------------------------
    // ⭐️ hideHotspotLabel(id) 함수 ⭐️ (Ref 사용하여 클릭 상태 확인)
    // ----------------------------------------------------
    function hideHotspotLabel(id) {
      const target = hotspots.find(h => h.id === id);

      // ⭐️ 수정: Ref를 사용하여 현재 선택된 핫스팟인지 확인합니다. ⭐️
      const isSelected = selectedHotspotRef.current?.id === id;

      if (target && target.element && !isSelected) {
        target.element.classList.remove('active');
      }
    }

    const setRealViewportUnits = () => {
      const vh = window.innerHeight * 0.01;
      const vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vw}px`);
    };






    // ----------------------------------------------------
    // ⭐️ 창 크기 조정 함수 (간결하게 수정) ⭐️
    // ----------------------------------------------------
    const onWindowResize = () => {
      setRealViewportUnits();
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isPortrait = height > width; 
      setIsMobileRatio(isPortrait);

      const closest = findClosestRatio(width / height);
      setMode(closest);
      modeRef.current = closest;   // 🔥 ref 에도 반영

      // 1. 리사이즈 시점의 최신 ratio 값을 계산해서 'newRatio' 변수에 저장합니다.
      let newRatio;
      if (closest.mode !== "tablet_portrait") {
        newRatio = Math.min(width / closest.width, height / closest.height);
      } else {
        newRatio = Math.min(width / closest.width, height / closest.height);
      }

      newRatio = 1 + (newRatio - 1) * 0.85;

      newRatio = Math.max(newRatio, 0.5);

      setRatio(newRatio);          // state 업데이트
      ratioRef.current = newRatio; // 🔥 ref 에도 반영

      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const controls = controlsRef.current; 

      if (camera && renderer && controls) {
        camera.aspect = width / height;
        renderer.setSize(width, height);

        const offsetX = width * main_offsetX;
        const offsetY = height * main_offsetY;

        camera.setViewOffset(width, height, offsetX, offsetY, width, height);

        camera.updateProjectionMatrix();

        // 🚨 수정된 부분 시작 🚨
        // 원점 (level2Id: '3-1')의 구면 좌표 데이터
        const originView = targetViews['3-1'];

        // 도(Degree) 값을 라디안(Radian)으로 변환
        const phiRad = THREE.MathUtils.degToRad(originView.phi);
        const thetaRad = THREE.MathUtils.degToRad(originView.theta);

        const finalSpherical = new THREE.Spherical(
          originView.radius + 0.35, // 줌 레벨 조정
          phiRad, // ⭐️ 라디안 사용 ⭐️
          thetaRad // ⭐️ 라디안 사용 ⭐️
        );

        const newCameraPosition = new THREE.Vector3().setFromSpherical(finalSpherical);

        camera.position.copy(newCameraPosition);

        controls.update();

        updateHotspots();
      }
    };


    // 애니메이션 루프
    function animate() {
      const delta = clockRef.current.getDelta();

      // if (animationMixerRef.current) {
      //   const mixer = animationMixerRef.current;
      //   //mixer.update(1000 / 60);

      //   const dt = 1 / 60; // export된 애니메이션 fps
      //   let time = mixer.time + dt;
      //   mixer.setTime(time);

      // }

      const dt = 1/60; // 초당 60프레임 (THREE.Clock의 delta를 사용하는 것이 더 정확하지만, 기존 로직 유지를 위해 dt 사용)
      animationMixersRef.current.forEach(mixer => {
        let time = mixer.time + dt;
        mixer.setTime(time);
      });

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        //rendererRef.current.render(sceneRef.current, cameraRef.current);

        rendererRef.current.clear();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      updateHotspots();
      //animationFrameId = requestAnimationFrame(animate);

      setTimeout(function () {
        requestAnimationFrame(animate);
      }, 1000 /60);
    }

    // 모델 로드 함수 (이하 동일)
    function loadModel() {
      // 로드해야 할 모든 모델 URL 배열
      const modelUrls = [MODEL_URL, MODEL_URL2, MODEL_URL3, MODEL_URL4, MODEL_URL5, MODEL_URL6, MODEL_URL7, MODEL_URL8, MODEL_URL9, MODEL_URL10];
      const gltfLoader = new GLTFLoader();

      if (isLoadingRef.current) {
        //console.warn("모델 로딩이 이미 시작되어 중복 로드를 건너뜁니다. (Strict Mode 차단)");
        return Promise.resolve();
      }

      // 2. 모델이 이미 로드 완료되었다면 로드 방지 (일반적인 중복 방지)
      if (modelRef.current && sceneRef.current?.children?.length > 0) {
        //console.warn("모델이 이미 로드 완료되어 중복 로드를 건너뜁니다.");
        return Promise.resolve();
      }

      // 3. ⭐️ 로드 작업을 시작하기 직전에 플래그 설정 ⭐️ (가장 중요)
      isLoadingRef.current = true;
      //console.warn("load model init (Actual Load Start)");

      // 각 모델의 로딩 상태를 추적하는 배열
      const modelLoadPromises = modelUrls.map((url, index) => {
        return new Promise((resolve, reject) => {

          // 모델별 로딩 성공 시 로직
          gltfLoader.load(
            url,
            (gltf) => {
              const model = gltf.scene;

              // 첫 번째 모델만 modelRef에 저장하고, 나머지는 scene에 추가 (필요에 따라 로직 변경)
              if (index === 0) {
                modelRef.current = model;
              }

              sceneRef.current.add(model);

              // 스케일 및 위치 설정 (모든 모델에 동일하게 적용)
              model.scale.set(0.1, 0.1, 0.1);
              model.position.set(0, 0, 0);

              // 렌더링 순서 설정 (모델 URL에 따라 분리)
              model.renderOrder = (index === 0) ? 1 : 3;



              // 애니메이션 믹서 설정 (선택적: 첫 번째 모델에만 믹서 설정)
              if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);

                // ⭐️ 수정: 단일 Ref 대신 배열 Ref에 믹서 추가 ⭐️
                animationMixersRef.current.push(mixer);

                const clip = gltf.animations[0];

                // animationMixerRef.current = mixer; // ❌ 이 줄은 제거합니다.

                // 👇 ref에 저장
                clipRef.current = clip;

                const action = mixer.clipAction(clip);
                actionRef.current = action; // 👈 이것도 저장

                action.setLoop(THREE.LoopRepeat, Infinity);
                action.interpolation = THREE.InterpolateDiscrete;
                action.enabled = true;
                action.setEffectiveWeight(1.0);

                clip.tracks.forEach(track => {
                  //console.log(track);
                  track.setInterpolation(THREE.InterpolateDiscrete);
                });

                action.play();
                //console.log(`animation find and play for model ${index + 1}`);
              }

              resolve({ url: url, gltf: gltf });
            },

            // 로딩 진행 상황 (onProgress) 처리 (각 모델의 진행률을 따로 처리)
            // 이 부분을 건드리지 않고, 최종 hideLoader()만 관리합니다.
            (xhr) => {
              // 전체 진행률을 계산하려면, 이 로직을 변경하여 모든 모델의 xhr.loaded / xhr.total을 합산해야 합니다.
              // 간단하게는 마지막 모델의 진행률만 표시하거나, 아래처럼 표시합니다.
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              
            },

            // 에러 처리
            (error) => {
              //console.error(`3D 모델 로드 실패: ${url}`, error);
              reject(error);
            }
          );
        });
      });

      // Promise.all로 모든 모델 로드가 완료되기를 기다립니다.
      return Promise.all(modelLoadPromises)
        .then(() => {
          // ⭐️ 모든 모델이 성공적으로 로드된 후 한 번만 호출 ⭐️
          hideLoader();
          updateHotspots(); // 최종적으로 핫스팟 업데이트
          // 모든 모델 로딩 완료 후 최종 resolve
        })
        .catch(error => {
          // 로드 중 하나라도 실패하면 로딩 화면을 숨기고 에러 출력
          //console.error("하나 이상의 모델 로드 실패:", error);
          hideLoader();
          throw error; // init 함수로 에러를 전파
        });
    }

    // ----------------------------------------------------
    // ⭐️ INIT & 핫스팟 DOM 생성 로직 ⭐️
    // ----------------------------------------------------
    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 핫스팟 DOM 초기화
      document.querySelectorAll('.hotspot--l2').forEach(el => el.remove());

      // 1. Renderer 설정 및 Ref 연결
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      rendererRef.current = renderer;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.shadowMap.enabled = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.autoClear = false;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // 2. Scene 설정 및 Ref 연결
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 환경 맵 (HDRI/PNG) 로드
      // const textureLoader = new THREE.TextureLoader();
      // textureLoader.load(
      //   '/hdri/Glazed Patio.png',
      //   (texture) => {
      //     texture.mapping = THREE.EquirectangularReflectionMapping;
      //     scene.environment = texture;
      //   }
      // );

      // 3. Camera 설정 및 Ref 연결
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 2000);

      // ⭐️ 카메라 위치 조정: 모델 크기가 1.0이라고 가정하고 적절히 가깝게 설정 ⭐️
      camera.position.set(0, 0.2, 1.1); // Z축을 1.8로 조정
      cameraRef.current = camera;



      // 4. Controls 설정 및 Ref 연결
      const controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enablePan = false;
      controls.target.set(0, 0, 0);
      controls.rotateSpeed = 0.65;
      controls.addEventListener('change', handleCameraChange);

      controls.addEventListener('start', hideCenterContainer);

      // 5. 조명 설정
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
      dirLight.position.set(0, 0, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // ⭐️ 주변광(Ambient Light) 추가 ⭐️
      // AmbientLight(color, intensity)
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // 밝기 1.5
      scene.add(ambientLight);

      const spotLight = new THREE.SpotLight(0xffffff, 30); // 밝기를 높여 모델에 집중
      spotLight.position.set(0, 2, 0); // 모델 위, 카메라 앞쪽에서 비추도록 위치 설정
      spotLight.angle = Math.PI / 4; // 조명 각도 (좁게 설정)
      spotLight.penumbra = 0.5; // 빛의 가장자리 부드럽게 처리
      spotLight.decay = 1; // 거리에 따른 빛 감소율
      spotLight.target.position.set(0, 0, 0); // 모델 중앙을 타겟
      scene.add(spotLight);
      scene.add(spotLight.target); // target도 씬에 추가해야 작동합니다.

      // ⭐️ 격자(Grid) Helper 추가 ⭐️
      // const size = 15;
      // const divisions = 40;
      // const colorCenter = 0x666666; // 0x111111보다 밝게
      // const colorGrid = 0x888888; // 0x222222보다 밝게

      // const gridHelper = new THREE.GridHelper(size, divisions, colorCenter, colorGrid);
      // gridHelper.material.transparent = true;
      // gridHelper.material.opacity = 0.3; // 투명도 조절
      // gridHelper.material.transparent = true; // 투명도 적용을 위해 필요
      // //gridHelper.material.depthTest = false; // 다른 물체와 깊이 테스트 안 함
      // //gridHelper.material.depthWrite = false; // 다른 물체에 깊이 값 기록 안 함
      // // 톤 매핑을 적용하지 않아 색상을 그대로 유지 (선이 밝아지는 것 방지)
      // gridHelper.material.toneMapped = true;
      // scene.add(gridHelper);

      ////////////////////
      // const planeSize = 30; // 격자보다 넓게 설정
      // const floorGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

      // // PBR 재질을 사용하여 빛의 영향을 받게 합니다.
      // const floorMaterial = new THREE.MeshStandardMaterial({ 
      //     color: 0x333333, // 배경색과 일치
      //     transparent: true, // 👈 투명도를 사용하겠다고 선언
      //     opacity: 0.1,      // 👈 투명도 값 설정 (0.0은 완전 투명, 1.0은 완전 불투명)

      //     roughness: 0,    // 거칠기를 높여 반사를 줄이면 배경에 더 잘 묻힙니다.
      //     metalness: 0.0,
      // });

      // const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      // floor.rotation.x = -Math.PI / 2; // X축으로 90도 회전 (바닥)
      // floor.position.y = -0.01; // 격자보다 아주 살짝 낮게 (GridHelper 위에 보이도록)
      // scene.add(floor);


      ///////////////////

      await loadModel();

      // 6. 이벤트 바인딩 및 초기화
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('orientationchange', onWindowResize);

      onWindowResize(); // 초기 크기 설정

      // ⭐️ 핫스팟 DOM 생성 및 이벤트 바인딩 ⭐️
      const containerEl = document.querySelector('.container') || document.body;

      document.querySelectorAll('.hotspot--l2').forEach(el => el.remove());

      hotspots = hotspotsData.map(data => {
        const element = document.createElement('div');
        element.id = data.id;
        element.className = 'hotspot hotspot--l2';
        element.dataset.level2Id = data.level2Id;

        const span = document.createElement('span');
        const label = document.createElement('div');
        label.className = 'hotspot-label';
        label.textContent = data.label;

        element.appendChild(span);
        element.appendChild(label);

        element.addEventListener('mouseenter', () => showHotspotLabel(data.id));
        element.addEventListener('mouseleave', () => hideHotspotLabel(data.id));
        element.addEventListener('click', () => handleHotspotClick(data.level2Id));

        containerEl.appendChild(element);

        return {
          ...data,
          element: element,
        };
      });

      animate();
    }

    initLottie();
    // ⭐️ Three.js 초기화 시작 ⭐️
    init();

    // ⭐️ 추가: 전역 클릭 이벤트 핸들러 ⭐️
    const handleGlobalClick = (event) => {
      // 핫스팟 요소가 클릭된 경우(Hotspot-1-1 등)는 Hotspot 클릭 로직이 이미 처리하므로 무시
      // 클릭된 요소가 'hotspot' 클래스를 포함하는지 확인
      if (event.target.closest('.hotspot') || event.target.closest('.right-panel-wrapper')) {
        return; // 핫스팟 또는 상세 패널 클릭은 무시
      }

      // isDetailView 상태가 아닐 때만, 즉 메인 뷰일 때만 중앙 컨테이너 숨김
      // 또는, 간단하게 showCenterContainer가 true일 때만 숨기도록 합니다.
      if (showCenterContainer) {
        hideCenterContainer();
      }
    };

    // ⭐️ useEffect 외부에서 정의한 hideCenterContainer를 직접 호출 ⭐️
    // 단, 이 로직은 App 컴포넌트의 최상단에서 showCenterContainer 상태를 참조해야 하므로
    // useEffect 밖에 있는 `hideCenterContainer` 함수를 사용합니다.

    // ⭐️ 돔 마운트/업데이트 시 전역 이벤트 리스너 등록 ⭐️
    document.addEventListener('mousedown', hideCenterContainer);

    // Cleanup: 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('orientationchange', onWindowResize);
      controlsRef.current?.removeEventListener('change', handleCameraChange);
      cancelAnimationFrame(animationFrameId);

      hotspots.forEach(h => h.element?.remove());

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      
    };
  }, []); // ⭐️ 복원: 의존성 배열을 빈 배열 `[]`로 유지합니다.

  // ------------------------------------
  // 4. RENDER
  // ------------------------------------
  return (
    <>
      <div className="container"
        style={{
          '--hotspot-scale': Math.max(ratio, 0.5) * 1.3,
        }}

      >


        {/* ⭐️ 1. 모바일 환경 경고 팝업 (추가) ⭐️ */}
        {isMobileRatio && (
          <div
            className="mobile-warning-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)', // 어두운 배경
              zIndex: 10000, // 최상단에 위치
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              className="mobile-warning-box"
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '22px 8.8vw',
                textAlign: 'center',
                maxWidth: '80%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              <img
              src="/images/icon_mobile_warning.png"
              alt=""
              style={{
                width: '20%',
                height: 'auto',
                pointerEvents: "none",

              }}
            />
              <div
                style={{
                  fontSize: `clamp(10px, 4.0vw, 20px)`,
                  fontWeight: '500',
                  lineHeight : '150%',
                  color: '#323539',
                  marginBottom: `clamp(10px, 5.3vw, 20px)`,
                }}
              >
                현재 서비스는 모바일 환경을 지원하지 않습니다.<br />이용을 원하시면 PC에서 접속해 주세요.
              </div>
              
              <button
                onClick={() => setIsMobileRatio(false)} // '확인' 버튼 클릭 시 팝업 닫기 (선택적)
                style={{
                  width: '40%',
                  padding: '12px',
                  backgroundColor: '#F1F1F1',
                  color: '#323539',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: `clamp(10px, 4.0vw, 20px)`,
                  fontWeight: '600',
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}


        {/* 캔버스에 ref 연결 */}
        <canvas id="canvas" ref={canvasRef}></canvas>

        {/* 로더 영역: isLoading이 true일 때만 표시 */}
        {isLoading && (
          <div id="loader" ref={loaderRef}>
            <div className="spinner_wrapper">
              {/* 🌟 Lottie 애니메이션이 삽입될 DOM 요소 🌟 */}
              <div className='spinner_lottie' ref={lottieContainerRef} style={{ width: 110, height: 110 }}></div>
              <div className='spinner_text'>Loading...</div>
            </div>
          </div>
        )}

        {/* 기타 UI 요소 */}
        <div className="aura-bg" aria-hidden="true"></div>

        <div className="top-container"
          style={{
            display: 'absolute',
            transform: `scale(${ratio / 1.0})`,
            transformOrigin: 'top left',
            display: 'flex',
            flexDirection: 'column',
            top: '0px',
            left: '0px',
            position: 'relative',
            userSelect: 'none',
            //pointerEvents: 'none',


          }}
        >
          <div id="logo-image"
            onClick={() => handleDetailViewClose()}
            style={{
              transformOrigin: 'top left',
              top: '72px',
              left: '56px',
              zIndex: '5',
              position: 'absolute',
              cursor: 'pointer',
            }}
          >
            <img
              src="/images/icon_2.png"
              alt=""
              style={{
                width: '227px',
                height: 'auto',
                pointerEvents: "none",

              }}
            />
          </div>
        </div>

        <div className="bottom-container"

          style={{
            display: 'absolute',
            transform: `scale(${ratio / 1.0})`,
            transformOrigin: 'bottom center',
            display: 'flex',
            flexDirection: 'column',
            bottom: '0px',
            left: '50%',
            position: 'absolute',
            userSelect: 'none',
            pointerEvents: 'none',



          }}
        >
          <div id="guide-image2"
            ref={bottomContainerRef}
            style={{
              transformOrigin: 'bottom center',
              bottom: '-170px',
              left: '50%',

              transform: 'translateX(-50%) translateY(100%)',
              zIndex: '5',
              position: 'absolute',
              display: 'none',
            }}
          >
            <img
              src="/images/icon_4.png"
              alt=""
              style={{
                width: '327px',
                height: 'auto',
                pointerEvents: "none",

              }}
            />
          </div>


        </div>

        <div className="center-container"
          // onClick={hideCenterContainer} 👈 이 부분 제거
          style={{
            // opacity와 pointerEvents를 사용하여 표시/숨김을 제어합니다.
            opacity: showCenterContainer ? 1 : 0, // ⭐️ 상태에 따른 투명도 조절 ⭐️
            pointerEvents: showCenterContainer ? 'auto' : 'none', // ⭐️ 표시될 때만 클릭 가능 ⭐️
            transition: 'opacity 0.5s ease-in-out', // 부드러운 전환 효과 추가

            // 기존 스타일 유지
            transform: `scale(${ratio / 1.0})`,
            transformOrigin: 'center',
            display: 'flex',
            flexDirection: 'column',
            top: '23%',
            left: '64%',
            position: 'absolute',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 99,
          }}
        >
          <img
            src="/images/icon_guide.png"
            alt="안내 이미지"
            style={{
              width: '415px',
              height: 'auto',
              // 이미지가 아닌 컨테이너에 이벤트가 걸려 있으므로, 이미지 자체의 pointerEvents는 'auto'로 변경합니다.
              pointerEvents: "auto",

            }}
          />
        </div>



        <div className="title-container"
          ref={titleContainerRef}
          style={{
            // display: 'absolute',
            transform: `scale(${ratio / 1.0})`,
            transformOrigin: 'top left',
            display: 'flex',
            flexDirection: 'column',
            top: '0px',
            left: '0px',
            //position: 'relative',
            position: 'absolute',
            width: '100%',
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',

          }}
        >
          {1 == 1 && <>
            <div id="title-1"
              style={{
                transformOrigin: 'top left',
                fontSize: '60px',
                fontFamily: 'Pretendard',
                fontWeight: '700',
                lineHeight: '146%',
                letterSpacing: '-0.05em',
                position: 'absolute',
                top: '317px',
                left: '56px',
                color: 'white',
              }}
            >
              환경을 이롭게<br />
              지속 가능한 미래를 위해
            </div>

            <div id="title-2"
              style={{
                transformOrigin: 'top left',
                letterSpacing: '-3.794px',
                fontSize: '28px',
                fontFamily: 'Pretendard',
                fontWeight: '600',
                lineHeight: '150%',
                letterSpacing: '-0.04em',
                position: 'absolute',
                color: '#CFD7FC',
                top: '517px',
                left: '56px',
              }}
            >
              ㈜네오에코의 NE Series를 만나보세요!
            </div>

            <div id="title-3"
              style={{
                transformOrigin: 'top left',
                letterSpacing: '-3.794px',
                fontSize: '22px',
                fontFamily: 'Pretendard',
                fontWeight: '500',
                lineHeight: '160%',
                letterSpacing: '-0.04em',
                position: 'absolute',
                color: '#CFD7FC',
                top: '570px',
                left: '56px',
              }}
            >
              <span className='title-3-check'>오염수 유입</span>부터 <span className='title-3-check'>처리수 배출</span>까지<br />
              NE-Series의 처리 공정을 만나보세요!
            </div>

            <div id="title-1-image"
              style={{
                transformOrigin: 'top left',
                top: '279px',
                left: '56px',
                zIndex: '5',
                width: '180.16px',
                position: 'absolute',
              }}
            >
              <img
                src="/images/icon_1.png"
                alt=""
                style={{
                  width: '180.16px',
                  height: 'auto',
                  pointerEvents: "none",

                }}
              />
            </div>



            <div id="guide-image"
              style={{
                transformOrigin: 'top left',
                top: '694px',
                left: '56px',
                zIndex: '5',
                width: '180.16px',
                position: 'absolute',
              }}
            >
              <img
                src="/images/icon_3.svg"
                alt=""
                style={{
                  width: '277px',
                  height: 'auto',
                  pointerEvents: "none",

                }}
              />
            </div>


          </>
          }
        </div>

        <div
          style={{
            position: 'absolute',
            top: '7.96vh',
            right: '72px',
            transform: `scale(${ratio / 1.0})`,
            transformOrigin: 'right top',
            zIndex: 9999,
            // pointerEvents는 안쪽 패널에서만 제어
          }}
        >

          <div className="right-panel-wrapper"
            ref={rightPanelRef}
            style={{
              width:
                selectedHotspot?.level2Id !== '2-1' &&
                  selectedHotspot?.level2Id !== '3-1'
                  ? '378px'
                  : '448px',
              backgroundColor: 'white',
              borderRadius: '32px 0px 32px 32px',
              // ✅ 이제 여기서는 translateX만 기본값으로 줌
              transform: 'translateX(250%)',
              transformOrigin: 'right top',
              pointerEvents: 'none', // GSAP 쪽에서 auto/none 바꿔주는 로직 그대로 사용
              position: 'relative',
            }}
          >
            <div className="right-panel-content"
              style={{
                padding: `${32 * ratio}px 24px 64px 24px`,
                color: 'black',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontFamily: 'Pretendard',
                  fontWeight: '600',
                  lineHeight: '100%',
                  letterSpacing: '-0.04em',
                  color: '#0068E0',
                  placeSelf: 'center',
                  margin: '0px 0px 22px 0px',
                }}
              >{selectedHotspot?.label || '선택된 항목'}</div>

              <div
                style={{
                  width: (selectedHotspot?.level2Id !== '2-1' && selectedHotspot?.level2Id !== '3-1') ? '100%' : '100%',
                  height: '1px',
                  backgroundColor: '#0068E0',
                  margin: '0px 0px 22px 0px',
                }}
              ></div>

              {selectedHotspot && targetDetail[selectedHotspot.level2Id] && (
                <>
                  <div
                    style={{
                      fontSize: '16px',
                      fontFamily: 'Pretendard',
                      fontWeight: '400',
                      whiteSpace: 'pre-line',
                      margin: '0',
                      lineHeight: '150%',
                      letterSpacing: '-0.64px'
                    }}
                  >
                    {targetDetail[selectedHotspot.level2Id].detail}
                  </div>
                  {targetDetail[selectedHotspot.level2Id].src && (
                    <img
                      src={targetDetail[selectedHotspot.level2Id].src}

                      style={{ width: '100%', height: 'auto', paddingTop: '24px', }}
                    />
                  )}
                </>
              )}

              <button
                onClick={() => handleDetailViewClose()}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  border: 'none',
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  margin: '0',
                  width: '44px',
                  height: '44px',
                  background: `URL('/images/icon_close.png') no-repeat center center`,
                  backgroundSize: 'cover',
                  transform: 'translateX(50%) translateY(-50%)',

                }}
              >
              </button>
            </div>
          </div>
        </div>

        {/* <div className="right-panel-wrapper"
          ref={rightPanelRef}
          style={{
            position: 'absolute',

            top: '200px',
            right: '3.75vw',
            width: (selectedHotspot?.level2Id !== '2-1' && selectedHotspot?.level2Id !== '3-1') ? '19.68vw' : '23.33vw', // 패널 너비 설정

            //backgroundColor: 'rgba(0, 0, 0, 0.6)', // 배경색 예시
            backgroundColor: 'white', // 배경색 예시
            zIndex: 9999,
            // 초기에는 화면 밖에 숨겨둡니다.
            transform: `scale(${ratio / 1.0})  translateX(150%)`,
            transformOrigin: 'right top',
            pointerEvents: 'none',
            borderRadius: '32px 0px 32px 32px',
            // transform: `scale(${ratio / 1.0})`, // 필요에 따라 ratio 적용
            // transformOrigin: 'top right',
          }}
        >
          <div className="right-panel-content"
            style={{
              padding: '32px 24px 64px 24px',
              color: 'black',
              height: '100%',
              overflowY: 'auto',
              overflowX : 'hidden'
            }}
          >
            <h3
              style={{
                fontSize: '1.14vw',
                fontFamily: 'Pretendard',
                fontWeight: '600',
                lineHeight: '150%',
                letterSpacing: '-0.04em',
                color: '#0068E0',
                placeSelf: 'center',
                margin: '0px 0px 24px 0px',
              }}
            >{selectedHotspot?.label || '선택된 항목'}</h3>

            <div
              style={{
                width:  (selectedHotspot?.level2Id !== '2-1' && selectedHotspot?.level2Id !== '3-1') ? '17.18vw' : '20.83vw',
                height: '1px',
                backgroundColor: '#0068E0',
                margin: '0px 0px 24px 0px',
              }}
            ></div>

            {selectedHotspot && targetDetail[selectedHotspot.level2Id] && (
              <>
                <p
                  style={{
                    fontSize: '0.83vw',
                    lineHeight: '1.8',
                    fontFamily: 'Pretendard',
                    fontWeight: '400',
                    whiteSpace: 'pre-line',
                    margin: '0',
                  }}
                >
                  {targetDetail[selectedHotspot.level2Id].detail}
                </p>
                <img
                  src={targetDetail[selectedHotspot.level2Id].src}

                  style={{ width: '100%', height: 'auto', }}
                />
              </>
            )}

            <button
              onClick={() => handleDetailViewClose()}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                position: 'absolute',
                top: '0px',
                right: '0px',
                margin: '0',
                width: '44px',
                height: '44px',
                background: `URL('/images/icon_close.png') no-repeat center center`,
                backgroundSize: 'cover',
                transform: 'translateX(50%) translateY(-50%)',

              }}
            >
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
}

export default App;