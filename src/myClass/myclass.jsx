import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "../App.css";
import "../profile/profile.css";
import "./myclass.css";
import Modal from "react-modal";
Modal.setAppElement("#root");

function Myclass() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");
  const [courses, setCourses] = useState([]);
  const defaultImageUrl = "/defaultclass.png";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // 선택된 강의 ID

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  useEffect(() => {
    getclassList();
  }, []);
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
  const getclassList = async () => {
    const baseUrl =
      "https://sangsang2.kr:8080/api/lecture/own?permission=CREATOR";

    try {
      const response = await fetch(baseUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          if (data.error === "사용자 찾을 수 없음") {
            alert("사용자를 찾을 수 없습니다.");
          } else {
            alert("클래스 내역 불러오기에 실패했습니다."); // 다른 404 에러 처리
          }
        } else if (
          data.error === "토큰이 유효하지 않습니다." ||
          data.error === "토큰 사용자를 찾을 수 없습니다."
        ) {
          const newToken = await onRefreshToken(); // 새로운 토큰 요청

          if (newToken) {
            // 새로운 토큰이 있으면 재시도
            return getclassList(); // 다시 호출
          }
        } else {
          alert("클래스 내역 불러오기에 실패했습니다.");
        }
        return;
      }

      console.log(data, "data");

      const formattedData = data.map((course, i) => {
        console.log(course.imageUrl, i, "course imageUrl"); // 디버깅 로그 추가
        const imageUrl =
          course.imageUrl &&
          Array.isArray(course.imageUrl) &&
          course.imageUrl.length > 0
            ? course.imageUrl[0].imageUrl
            : defaultImageUrl;

        return {
          id: course.id,
          name: course.name,
          type: course.type,
          price: course.price,
          imageUrls: imageUrl,
        };
      });

      setCourses(formattedData);
      console.log(formattedData, "formattedData");
    } catch (error) {
      console.error("Error occurred during delete:", error);
      alert("Error occurred " + error.message);
    }
  };

  const onDeleteClass = async (id) => {
    const baseUrl = `https://sangsang2.kr:8080/api/lecture/delete/${id}`;
    console.log("id: ", id);
    try {
      const response = await fetch(baseUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        alert("강의 삭제에 실패했습니다.");
        console.log("Error Data:", response);
        closeModal();
        return;
      }
      const data = await response.text();
      closeModal();
      console.log("delete classroom success: ", data);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting classroom:", error);
      closeModal();
    }
  };

  return (
    <div id="mobile-view">
      <header className="app-header profileHeader defaultHeader">
        <Link to="/profile">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>나의 클래스</h3>
      </header>
      <main id="default-padding" className="profileMain">
        <div id="myclass-header">
          <h3>내가 생성한 클래스</h3>
        </div>
        <section className="myclass-main myclass-gridBox">
          {courses.map((course) => (
            <div key={course.id} className="myclass-box">
              <img
                src={course.imageUrls}
                alt={course.name}
                className="myclass-box_img"
              />
              <h4
                className="myclass-box_title"
                onClick={() => navigate(`/home/class_application/${course.id}`)}
              >
                {course.name}
              </h4>
              <span className="myclass-box_price">
                ${course.price.toLocaleString()}
              </span>
              <div className="myclass-box_type">
                <span>{course.type === "Regular" ? "정규" : "원데이"}</span>
              </div>
              <div className="myclass-box-btn">
                <button
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    openModal();
                  }}
                >
                  강의 삭제
                </button>
              </div>
            </div>
          ))}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="강의 삭제하기"
            className="modal"
            overlayClassName="overlay"
          >
            <h2>강의를 삭제하시겠습니까??</h2>
            <div className="modal-buttons">
              <button
                onClick={() => onDeleteClass(selectedCourseId)}
                className="confirm-btn"
              >
                네
              </button>
              <button onClick={closeModal} className="cancel-btn">
                아니요
              </button>
            </div>
          </Modal>
        </section>
      </main>
    </div>
  );
}

export default Myclass;
