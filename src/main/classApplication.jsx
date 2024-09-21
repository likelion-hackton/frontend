import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./navbar";
import "./css/class_application.css";

const ClassApplication = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");
  const [classData, setClassData] = useState(null);
  const defaultImageUrl = "/defaultclass.png";
  const { id } = useParams(); // URL에서 id 가져오기

  const onRefreshToken = async () => {
    const refreshResponse = await fetch(
      "https://sangsang2.kr:8080/api/memebr/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      }
    );

    const refreshData = await refreshResponse.json();
    if (refreshResponse.ok) {
      // 새로운 액세스 토큰 저장
      localStorage.setItem("token", refreshData.accessToken);
      return refreshData.accessToken; // 새로운 토큰 반환
    } else {
      alert("로그인 기간이 만료되었습니다.");
      navigate("/login"); // 로그인 페이지로 리다이렉트
      return null; // 실패 시 null 반환
    }
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(
          `https://sangsang2.kr:8080/api/lecture/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Response status:", response.status); // 응답 상태 확인
        const data = await response.json();
        if (!response.ok) {
          if (
            data.error === "토큰이 유효하지 않습니다." ||
            data.error === "토큰 사용자를 찾을 수 없습니다."
          ) {
            const newToken = await onRefreshToken(); // 새로운 토큰 요청

            if (newToken) {
              // 새로운 토큰이 있으면 재시도
              return fetchClassData(); // 다시 호출
            }
          }
          console.log("Error Data:", data);
          return;
        }
        setClassData(data);
        console.log(classData, "data");
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };
    console.log(classData, "classData");

    fetchClassData();
  }, [id]);

  if (!classData) {
    return <div>No data available</div>;
  }

  const {
    name,
    description,
    price,
    type,
    member_limit,
    startTime,
    endTime,
    date,
    startDate,
    endDate,
    daysOfWeek,
    latitude,
    longitude,
    address,
    detailAddress,
    category,
    averageScore,
    scoreCount,
    imageUrl,
    remainingSpace,
  } = classData;

  return (
    <div id="mobile-view">
      <header className="app-header applicationHeader defaultHeader">
        <Link to="/home/class_list">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
      </header>
      <main id="classApplicationMain">
        <div className="classBanner">
          <img
            src={
              imageUrl && imageUrl.length > 0
                ? imageUrl[0].imageUrl
                : defaultImageUrl
            }
            alt="Class Banner"
            className="banner-image"
          />
        </div>
        <section className="classApplicationSection">
          <div className="titleContainer">
            <Link
              to={`/home/class_application/review/${id}`}
              className="classRating"
            >
              {/*리뷰 상세페이지 존재를 모를 것 같아서 수정해봄*/}
              <span className="star">⭐</span> {averageScore} ({scoreCount})
              <span className="gotoReview">리뷰 보기</span>
            </Link>
            <h3 className="classTitle">{name}</h3>
            <p className="classDate">
              {type === "Regular"
                ? `${startDate} - ${endDate}  ${daysOfWeek}`
                : date}
              <br />
              {/*     {type === "Regular" ? `${daysOfWeek}` : ""}<br/> */}
              {`${startTime} - ${endTime}`}
            </p>
            <p className="classDescription">{description}</p>
          </div>
          <div className="classLocationBox classInfoBox">
            <p className="locationTxt">위치</p>
            <p>
              {address} {detailAddress}
            </p>
          </div>
          <div className="classCapacityBox classInfoBox">
            <p className="capacityTxt">클래스 인원 수</p>
            <p>{member_limit}</p>
          </div>
          <div className="classParkingBox classInfoBox">
            <p className="parkingTxt">가격</p>
            <p>$ {price}</p>
          </div>
          <div className="classParkingBox classInfoBox">
            <p className="parkingTxt">클래스 유형</p>
            <p>{type}</p>
          </div>
        </section>
      </main>
      <div className="applicationBtnBox">
        <button
          className="applicationBtn"
          onClick={() =>
            navigate(`/home/class_application/detail/${id}`, {
              state: { classData },
            })
          }
        >
          신청하기
        </button>
        <button
          className="chatBtn"
          onClick={() => navigate("/chatting", { state: { id, name } })}
        ></button>
      </div>
    </div>
  );
};

export default ClassApplication;
