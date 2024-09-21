import { React, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../main/navbar";
import "../App.css";
import "./chats.css";

function Chats() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refresh_token");
  const [chatRoomList, setChatRoomList] = useState([]);
  const [myImg, setMyImg] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const navigate = useNavigate();
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

  const getChatsList = async (e) => {
    const baseUrl = "https://sangsang2.kr:8080/api/chat/chatRoom/all";

    try {
      const response = await fetch(baseUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (
          data.error === "토큰이 유효하지 않습니다." ||
          data.error === "토큰 사용자를 찾을 수 없습니다."
        ) {
          const newToken = await onRefreshToken(); // 새로운 토큰 요청

          if (newToken) {
            // 새로운 토큰이 있으면 재시도
            return getChatsList(); // 다시 호출
          }
        }
        console.log("Error Data:", data);
        return;
      }

      const { chatRoomList, memberInfoImageUrl } = data;
      const chatRooms = chatRoomList.map((chatRoom) => ({
        chatRoomId: chatRoom.chatRoomId,
        receiverImg: chatRoom.receiverImageUrl,
        chatRoomName: chatRoom.chatRoomName,
        count: chatRoom.notReadMessageCount,
        nickname: chatRoom.receiverNickname,
        amIowner: chatRoom.isLectureOwner,
      }));

      const processedData = {
        myImg: memberInfoImageUrl,
        chatRooms: chatRooms, // 가공된 메시지 리스트
      };

      console.log(" get chatList Success:", processedData);
      setChatRoomList(chatRooms);
      setMyImg(memberInfoImageUrl);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // 필터링 로직
  const filteredChatRooms = chatRoomList.filter((chatRoom) => {
    if (selectedType === "all") return true; // 전체
    if (selectedType === "mine") return chatRoom.amIowner === false; // 내 문의
    if (selectedType === "received") return chatRoom.amIowner === true; // 내가 받은 문의
    return true; // 기본값
  });

  useEffect(() => {
    getChatsList(); // 초기 호출
    //const intervalId = setInterval(getChatsList, 10000); // 5초마다 호출

    // return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 클리어
  }, []); // 빈 배열로 초기 마운트 시만 실행되도록

  return (
    <div id="mobile-view" className="chatsBg">
      <div id="chats-default-padding" className="chatsDefault">
        <header className="chatHeader">
          <div id="chats_header">
            <img id="chats_myImg" src={myImg || "/user.png"} />
          </div>
          <div id="chats_title">
            <h1>Chats</h1>
          </div>
        </header>
        {/* 필터링 버튼 */}
        <div id="chatRoomTypeButtons">
          <button
            onClick={() => setSelectedType("all")}
            className={selectedType === "all" ? "chatBtnActive" : ""}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedType("mine")}
            className={selectedType === "mine" ? "chatBtnActive" : ""}
          >
            내 문의
          </button>
          <button
            onClick={() => setSelectedType("received")}
            className={selectedType === "received" ? "chatBtnActive" : ""}
          >
            내가 받은 문의
          </button>
        </div>
        <div id="chats_list">
          {filteredChatRooms.map((chatRoom) => (
            <div
              key={chatRoom.chatRoomId}
              className="chats_listItem"
              onClick={() =>
                navigate(
                  `/sendingChats?chatRoomId=${chatRoom.chatRoomId}&chatRoomName=${chatRoom.chatRoomName}`
                )
              }
            >
              <div className="chats_li-column">
                <img
                  className="chats_li-img"
                  src={chatRoom.receiverImg || "/creator.png"}
                  alt={chatRoom.nickname}
                />
                <h2 id="chats_li-title">{chatRoom.chatRoomName}</h2>
              </div>
              <div className="chats_li-column">
                {chatRoom.count === 0 ? (
                  ""
                ) : (
                  <span id="chats-readingCount">{chatRoom.count}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navbar></Navbar>
    </div>
  );
}

export default Chats;
