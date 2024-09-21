import { React, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/review.css";
import "./css/reviewDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

function ReviewDetail() {
  const location = useLocation();
  const { reviewData, id } = location.state || {};
  const memberImageUrl = reviewData.memberImageUrl;
  const reviewComment = reviewData.reviewComment;
  const createdTime = reviewData.createdTime;
  const memberNickname = reviewData.memberNickname;
  const reviewImageUrl = reviewData.reviewImageUrl;
  useEffect(() => {
    console.log("Received reviewData:", reviewData);
    console.log("Received id:", id);
  }, []);
  return (
    <div id="mobile-view">
      <header className="app-header reviewHeader defaultHeader">
        <Link to={`/home/class_application/review/${id}`}>
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>리뷰 자세히보기</h3>
      </header>

      <div className="reviewDetail-InfoBox">
        <img src={memberImageUrl || "/user.png"} />
        <h4>{memberNickname}</h4>
        <h6>{createdTime}</h6>
      </div>
      <div className="reviewdetail-comment">
        <p>{reviewComment}</p>
      </div>
      <div className="reviewDetail-mainImg">
        <img
          src={
            reviewImageUrl && reviewImageUrl.length > 0
              ? reviewImageUrl[0].imageUrl
              : "/defaultclass.png"
          }
        />
      </div>
    </div>
  );
}

export default ReviewDetail;
