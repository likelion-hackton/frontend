import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "../App.css";
import "../profile/profile_c.css";
import "../profile/profile.css";
import "./makeReview.css";

function MakeReview2() {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");
  const location = useLocation();
  const rate = location.state?.rate || 0;
  const courseId = location.state?.courseId || "";
  const image = location.state?.image || null;
  const rateInt = parseFloat(rate);
  const lectureId = parseFloat(courseId);
  const requestDTO = {
    reviewComment: comment,
    score: rateInt,
    lectureId: lectureId,
  };

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

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const baseUrl = "https://sangsang2.kr:8080/api/review/write";
    console.log("review3", requestDTO, "image: ", image);
    formData.append(
      "review",
      new Blob([JSON.stringify(requestDTO)], { type: "application/json" })
    );

    if (image) {
      formData.append("images", image, image.name);
    }

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          if (data.error === "존재하지 않는 회원입니다") {
            alert("사용자를 찾을 수 없습니다.");
          } else if (data.error === "존재하지 않는 클래스입니다.") {
            alert("존재하지 않는 클래스입니다.");
          } else if (data.error === "이미 리뷰를 작성한 회원입니다.") {
            alert("이미 리뷰를 작성한 회원입니다.");
          } else {
            alert("리뷰 생성에 실패했습니다."); // 다른 404 에러 처리
          }
        } else if (
          data.error === "토큰이 유효하지 않습니다." ||
          data.error === "토큰 사용자를 찾을 수 없습니다."
        ) {
          const newToken = await onRefreshToken(); // 새로운 토큰 요청

          if (newToken) {
            // 새로운 토큰이 있으면 재시도
            return onSubmit(); // 다시 호출
          }
        } else {
          alert("리뷰 생성에 실패했습니다.");
        }
        console.log(data.error);
        return;
      }

      console.log("Success:", data);
      navigate("/profile");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div id="mobile-view">
      <div id="default-padding">
        <header className="app-header header_1components">
          <img
            src="/arrow.png"
            id="header-arrowIcon"
            onClick={() => navigate("/makeReview2")}
          />
        </header>
        <div id="header-title">
          <h2>
            클래스를 <br />
            평가해주세요
          </h2>
        </div>
        <div className="process-dot-box">
          <span className="process-dot"></span>
          <span className="process-dot"></span>
          <span className="process-dot  blue-dot"></span>
        </div>
        <h2 id="profile-questionTxt">3단계: 리뷰 작성하기</h2>
        <div id="review-questionBox">
          <h4 className="review-sub-title">여러분의 리뷰를 작성해주세요.</h4>
        </div>
        <div className=" editProfile-textarea review-textarea">
          <textarea
            type="text"
            onChange={(e) => {
              setComment(e.target.value);
            }}
          />
        </div>

        <button className="nextBtn secondBtn" onClick={onSubmit}>
          등록하기
        </button>

        <button className="nextBtn">취소하기</button>
      </div>
    </div>
  );
}

export default MakeReview2;
