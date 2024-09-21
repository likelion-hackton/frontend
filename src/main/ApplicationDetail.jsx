import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import "./css/applicationDetail.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";
import Modal from "react-modal";

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");
  const location = useLocation();
  const classData = location.state?.classData;
  const [count, setCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // classData.date를 초기 선택 날짜로 설정
  const initialDate = classData && classData.type == "OneDay" 
  ? new Date(classData.date) : new Date(classData.startDate);

  const [date, setDate] = useState(initialDate);
  const [classTime, setClassTime] = useState(null);

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
    console.log("Class Data:", classData);
    console.log("Class Date:", classData?.date);
  }, [classData]);

  useEffect(() => {
    if (classData) {
      // 선택된 날짜에 따라 수강 시간을 설정
      const selectedDate = moment(date).format("YYYY-MM-DD");
      if (classData.type === "OneDay" && selectedDate === classData.date) {
        const startTime = moment(classData.startTime, "HH:mm:ss").format("HH:mm");
        const endTime = moment(classData.endTime, "HH:mm:ss").format("HH:mm");
        setClassTime(`${startTime} - ${endTime}`);
      } else if (classData.type === "Regular" && selectedDate >= classData.startDate && selectedDate <= classData.endDate) {
        const startTime = moment(classData.startTime, "HH:mm:ss").format("HH:mm");
        const endTime = moment(classData.endTime, "HH:mm:ss").format("HH:mm");
        setClassTime(`${startTime} - ${endTime}`);
      } else {
        setClassTime(null);
      }
    }
  }, [date, classData]);

  useEffect(() => {
    console.log("remainingSpace  :", classData.remainingSpace);
  }, []);

  const handleDateChange = (date) => {
    setDate(date);
    // 선택된 날짜에 따라 수강 시간을 설정
    const selectedDate = moment(date).format("YYYY-MM-DD");
    if (classData.type === "OneDay" && selectedDate === classData.date) {
      const startTime = moment(classData.startTime, "HH:mm:ss").format("HH:mm");
      const endTime = moment(classData.endTime, "HH:mm:ss").format("HH:mm");
      setClassTime(`${startTime} - ${endTime}`);
    } else if (classData.type === "Regular" && selectedDate >= classData.startDate && selectedDate <= classData.endDate) {
      const startTime = moment(classData.startTime, "HH:mm:ss").format("HH:mm");
      const endTime = moment(classData.endTime, "HH:mm:ss").format("HH:mm");
      setClassTime(`${startTime} - ${endTime}`);
    } else {
      setClassTime(null);
    }
  };

  // 캘린더 특정 날짜에 따라 클래스 네임 반환 함수
const getTileClassName = (date) => {
  const dateObject = new Date(date);
  const formattedDate = moment(dateObject).format("YYYY-MM-DD");

  if (classData.type === "OneDay" && formattedDate === classData.date) {
    return "selectedDay";
  } 
  else if (classData.type === "Regular" && moment(dateObject).isBetween(classData.startDate, classData.endDate, null, "[]")) {
    return "selectedDay";
  }
  // 토요일 클래스 추가
  if (dateObject.getDay() === 6) {
    return "saturday"; 
  }
  return null;
};

  

  const handleApplicationClick = async () => {
    const baseUrl = `https://sangsang2.kr:8080/api/lecture/join?lecture=${id}&count=${count}`;

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          if (data.error === "사용자 찾을 수 없음") {
            alert("사용자를 찾을 수 없습니다.");
          } else if (data.error === "강의 찾을 수 없음") {
            alert("강의를 찾을 수 없습니다.");
          } else {
            alert("강의 신청에 실패했습니다."); // 다른 404 에러 처리
          }
        } else if (response.status === 400) {
          if (data.error === "이미 참가한 강의") {
            // alert("이미 참가한 강의입니다.");
            openModal("이미 참가한 강의입니다."); // 모달로 변경
          } else if (data.error === "강의 정원 가득참") {
            // alert("강의 정원이 가득 찼습니다.");
            openModal("강의 정원이\n가득 찼습니다."); // 모달로 변경
          } else if (data.error === "내가 개최한 강의") { // 추가된 부분
            openModal("본인이 개최한 강의는\n신청할 수 없습니다.");
            // alert("본인이 개최한 강의는 신청할 수 없습니다."); // 에러 메시지
          } else {
            openModal("강의 신청에\n실패했습니다.");
            // alert("강의 신청에 실패했습니다."); // 다른 400 에러 처리
          }
        } else if (
          data.error === "토큰이 유효하지 않습니다." ||
          data.error === "토큰 사용자를 찾을 수 없습니다."
        ) {
          const newToken = await onRefreshToken(); // 새로운 토큰 요청

          if (newToken) {
            // 새로운 토큰이 있으면 재시도
            return handleApplicationClick(); // 다시 호출
          }
        }
        {
          // alert("강의 신청에 실패했습니다.");
          console.log("강의 신청 실패")
        }
        return;
      }
      console.log('신청 성공',data);
      openModal("신청이 성공적으로\n완료되었습니다!"); // 성공 메시지 모달
      setTimeout(() => {
        navigate("/home"); // 2초 후에 페이지 이동
    }, 2000);
    } catch (error) {
      console.error("Error occurred during delete:", error);
      alert("Error occurred " + error.message);
    }
  };

  const handleCancelClick = () => {
    navigate("/home/class_list");
  };

  const increaseCount = () => {
    if (count < classData?.remainingSpace) {
      setCount(count + 1);
    }
  };

  const decreaseCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div id="mobile-view">
      <header className="app-header defaultHeader">
        <Link to={`/home/class_application/${id}`}>
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>클래스 신청하기</h3>
      </header>
      <main id="default-padding" className="detailApplicationMain">
        <section id="calendarBox">
        <Calendar
            formatDay={(locale, date) => moment(date).format("DD")}
            showNeighboringMonth={false} // 현재 월 이외의 날짜는 숨기기
            tileClassName={({ date }) => getTileClassName(date)}
            onChange={handleDateChange}
            value={
              classData.type === "OneDay"
                ? new Date(classData.date) 
                : [new Date(classData.startDate), new Date(classData.endDate)] // Regular 클래스일 때 날짜 범위
            }
          />
        </section>
        {date && (
          <section id="selectTimeBox">
            <h5>수강 시간</h5>
            <p style={{ fontSize: classTime ? "16px" : "12px" }}>
              {classTime ? classTime : "해당 날짜에 등록된 클래스가 없습니다."}
            </p>
          </section>
        )}
        <div id="personnelApplication">
          <h5 className="personnelTitle">신청 인원 수</h5>
          <div className="controlBtnBox">
            <button onClick={decreaseCount}>-</button>
            <p>{count}</p>
            <button
              disabled={count >= classData?.remainingSpace}
              onClick={increaseCount}
            >
              +
            </button>
          </div>
        </div>
      </main>
      <div className="detailApplicationBtnBox">
        <button className="payingBtn" onClick={handleApplicationClick}>
          신청하기
        </button>
        <button className="cancelBtn" onClick={handleCancelClick}>
          취소하기
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="알림"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{modalMessage}</h2>
        <div className="modal-buttons">
          <button onClick={closeModal} className="confirm-btn">
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationDetail;