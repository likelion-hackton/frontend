import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../main/navbar";
import "./map.css";
import loadingGif from "./media/loading.gif";

const ClassMap = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(null); // 현재 위치
    const [map, setMap] = useState(null); 
    const [selectedClass, setSelectedClass] = useState(null); // 선택된 클래스 정보
    const [classLocations, setClassLocations] = useState([]); // 클래스 위치 데이터 저장

    const new_script = src => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.addEventListener("load", () => {
                resolve();
            });
            script.addEventListener("error", e => {
                reject(e);
            });
            document.head.appendChild(script);
        });
    };

    const fetchCurrentPosition = () => { // Geolocation API 현재 위치 가져옴
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                const timeoutId = setTimeout(() => {
                    reject(new Error("Geolocation request timed out"));
                }, 10000); // 10초 후에 타임아웃

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeoutId); // 위치를 성공적으로 가져오면 타임아웃 해제
                        const { latitude, longitude } = position.coords;
                        resolve({
                            lat: latitude,
                            lng: longitude
                        });
                    },
                    (error) => {
                        clearTimeout(timeoutId); // 오류 발생 시 타임아웃 해제
                        console.error("현재 위치를 가져오지 못함 ", error);
                        alert("현재 위치를 가져오지 못했습니다. 위치 정보 접근을 허용했는지 확인해 주세요.");
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true, // 정확도
                        timeout: 5000, // 최대 대기 시간
                        maximumAge: 0 // 캐시된 위치 정보 설정
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                alert("사용 중인 브라우저는 현재 위치 정보를 지원하지 않습니다.");
                reject(new Error("Geolocation not supported"));
            }
        });
    };

    const fetchClassLocations = async () => {
        try {
            const response = await fetch("https://sangsang2.kr:8080/api/lecture/map");
            const data = await response.json();
            console.log(data, 'fetched class data'); 
            setClassLocations(data);
        } catch (error) {
            console.error("클래스 정보를 가져오지 못했음 ", error);
            alert('클래스 정보를 가져오지 못했습니다');
        }
    };

    useEffect(() => {
        const loadMapAndPosition = async () => {
            const scriptPromise = new_script('https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=31ab0c2dde1e7c5f97a4aba8000bfd13');
            const positionPromise = fetchCurrentPosition();
            
            try {
                await scriptPromise;
                const kakao = window['kakao'];
                const position = await positionPromise;
                setCurrentPosition(position);

                kakao.maps.load(() => {
                    const mapContainer = document.getElementById('map');
                    const options = {
                        center: new kakao.maps.LatLng(position.lat, position.lng),
                        level: 6
                    };
                    const map = new kakao.maps.Map(mapContainer, options);
                    setMap(map);

                    //줌 컨트롤러 설정
                    const zoomControl = new kakao.maps.ZoomControl();
                    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                    // 현재 위치에 마커 설정
                    const markerPosition = new kakao.maps.LatLng(position.lat, position.lng);
                    const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
                    const imageSize = new kakao.maps.Size(24, 35);
                    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
                    
                    const marker = new kakao.maps.Marker({
                        position: markerPosition,
                        image: markerImage,
                    });
                    marker.setMap(map);

                    setLoading(false); //지도 로드 완 로딩 완료
                });
                // 클래스 위치 데이터 가져오기
                await fetchClassLocations();
            } catch (error) {
                console.error("현재 위치를 불러오지 못했습니다 ", error);
                alert("현재 위치를 불러오지 못했습니다");
            }
        };

        loadMapAndPosition();
    }, []); // 초기 로드 시 지도 로드 및 클래스 데이터 가져오기

    useEffect(() => {
        if (!map || classLocations.length === 0) return;

        const kakao = window['kakao'];

        classLocations.forEach(location => {
            const markerPosition = new kakao.maps.LatLng(location.latitude, location.longitude);
            const marker = new kakao.maps.Marker({
                position: markerPosition
            });

            //마커 클릭시 인포창
            const infowindow = new kakao.maps.InfoWindow({
                content: `
                        <div className="info-window-content" style="padding:5px;font-size:12px;">
                            ${location.name} <br/>
                            <a href="https://map.kakao.com/link/to/${location.name},${location.latitude},${location.longitude}" style="color:blue" target="_blank">길찾기</a> 
                        </div>
                        `
            });

            let isOpen = false;

            kakao.maps.event.addListener(marker, 'click', () => {
                if (isOpen) {
                    infowindow.close();
                    setSelectedClass(null);
                    isOpen = false;
                } else {
                    infowindow.open(map, marker);
                    setSelectedClass(location);
                    isOpen = true;
                }
            });

            kakao.maps.event.addListener(map, 'click', () => {
                if (isOpen) {
                    infowindow.close();
                    setSelectedClass(null);
                    isOpen = false;
                }
            });

            marker.setMap(map);
        });
    }, [map, classLocations]); // map과 classLocations 변경될 때마다 마커 다시 그리기

    //인포모달창 클릭 시 상세 창으로 넘어감
    const handleClassInfoClick = () => {
        if (selectedClass && selectedClass.id) {
            navigate(`/home/class_application/${selectedClass.id}`, { state: { selectedClass } });
        } else {
            console.error("No class selected or missing class ID.");
        }
    };
    
    // 지도 중심을 현재 위치로 설정
    const handleResetCenter = () => {
        if (map && currentPosition) {
            const kakao = window['kakao'];
            const newCenter = new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
            map.setCenter(newCenter); 
            map.setLevel(5);
        }
    };

    return (
        <div id="mobile-view">
            <header className="app-header mapHeader">
                <h3>Map</h3>
            </header>
            <div id="map" className="map">
                {loading ? ( // 로딩 중일 때 비디오 표시
                    <>  
                        <div className="loadingBox">
                            <h2 className="loadingTxt">LOADING ...</h2>
                            <div className="logoWrapper">
                                <span className="logoIcon"></span>
                            </div>
                        </div>
                        {/* <video className="loadingVideo" autoPlay muted loop>
                            <source src={loadingVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video> */}
                        <img className="loadingGif" src={loadingGif} alt="Loading_gif" />
                    </>
                ) : (
                    <>
                        {currentPosition && (
                            <button onClick={handleResetCenter} className="resetMapBtn">
                                <span className="material-symbols-outlined">refresh</span>
                                현재 위치에서 검색
                            </button>
                        )}
                        {selectedClass && (
                            <div id="clickModal" className="class-info">
                                <span></span>
                                <div className="clickClassInfo" onClick={handleClassInfoClick}>
                                    <img src={selectedClass.imageUrl || ""} alt="" />
                                    <div className="classInfoTxt">
                                        <p className="selectedClassType">{selectedClass.category} _ {selectedClass.type === "OneDay" ? "원데이 클래스" : "정규 클래스"}</p>
                                        <h4 className="selectedClassName">{selectedClass.name}</h4>
                                        <p className="selectedClassTime">{selectedClass.date || `${selectedClass.startDate} ~ ${selectedClass.endDate}, ${selectedClass.startTime}`}</p>
                                        <p className="selectedClassAddress">{selectedClass.address} {selectedClass.detailAddress}</p>
                                        <p className="selectedClassPrice">{selectedClass.price}원</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Navbar />
        </div>
    );
};

export default ClassMap;