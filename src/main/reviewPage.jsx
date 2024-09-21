import { React, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./css/review.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const ReviewInquiry = () => {
  const { id } = useParams();
  const [review, setReview] = useState([]);
  const [averageScore, setAverageScore] = useState({});
  const [sortOption, setSortOption] = useState("latest");
  const ratingLabels = [5, 4, 3, 2, 1];
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 리뷰 데이터 및 평균 스코어 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `https://sangsang2.kr:8080/api/review/?lectureId=${id}`
        );
        const reviewData = await response.json();
        setReview(reviewData);
        console.log("reviewdata: ", reviewData);
      } catch (error) {
        console.error("리뷰 정보를 가져오지 못했습니다:", error);
        alert("리뷰 정보를 가져오지 못했습니다.");
      }
    };

    const fetchAverageScore = async () => {
      try {
        const response = await fetch(
          `https://sangsang2.kr:8080/api/review/score/average?lectureId=${id}`
        );
        const averageData = await response.json();
        setAverageScore(averageData);

        // 퍼센테이지 채워지는 애니메이션 효과 위해서 CSS 변수 설정
        const ratingBars = document.querySelectorAll('.ratingBarFill');
        ratingBars.forEach((bar, index) => {
            bar.style.setProperty('--rating-width', `${ratingScores[index]}%`);
            bar.classList.add('animated');
        });
      } catch (error) {
        console.error("평균 스코어 정보를 가져오지 못했습니다:", error);
        alert("평균 스코어 정보를 가져오지 못했습니다.");
      }
    };

    fetchReviews();
    fetchAverageScore();
  }, [id]);
  const ratingScores = [
    averageScore.scoreFive,
    averageScore.scoreFour,
    averageScore.scoreThree,
    averageScore.scoreTwo,
    averageScore.scoreOne,
  ]; // 별점에 대한 비율 배열

  // 리뷰 정렬
  const sortedReviews = () => {
    let sorted = [...review];
    if (sortOption === "rating") {
      sorted.sort((a, b) => b.score - a.score);
    } else {
      sorted.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
    }
    return sorted;
  };

  const gotoDetail = async (reviewId) => {
    try {
      const response = await fetch(
        `https://sangsang2.kr:8080/api/review/detail?reviewID=${reviewId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const reviewData = await response.json();
      if (!response.ok) {
        if (reviewData.error === "존재하지 않는 클래스입니다.") {
          alert("존재하지 않는 클래스입니다.");
        } else if (reviewData.error === "존재하지 않는 리뷰입니다.")
          alert("존재하지 않는 리뷰입니다.");

        console.log("Error Data:", reviewData);
        return;
      }

      console.log("review detail: ", reviewData);
      navigate("/home/class_application/review/detail", {
        state: { reviewData, id },
      });
    } catch (error) {
      console.error("리뷰 상세정보를 가져오지 못했습니다:", error);
      alert("리뷰 상세정보를 가져오지 못했습니다.");
    }
  };

  return (
    <div id="mobile-view">
      <header className="app-header reviewHeader defaultHeader">
        <Link to={`/home/class_application/${id}`}>
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>클래스 리뷰</h3>
      </header>
      <main id="reviewInner">
        <section className="reviewAverage">
          <div className="averageTitleBox">
            <h3>{averageScore.averageScore}</h3>
            <div className="totalStarBox">
              <div className="averageStar">
                {[...Array(5)].map((_, index) => (
                  <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className={
                      index < averageScore.averageScore ? "star filled" : "star"
                    }
                  />
                ))}
              </div>
              <span>{averageScore.totalReviewCount || 0}개 리뷰</span>
            </div>
          </div>

          <div className="averageRatingBox">
            {ratingLabels.map((label, index) => (
              <div key={label} className="ratingBarWrapper">
                <div className="ratingLabel">{label}</div>
                <div className="ratingBar">
                  <div
                    className="ratingBarFill"
                    style={{ width: `${ratingScores[index]}%` }}
                  ></div>
                </div>
                <div className="ratingPercentage">{ratingScores[index]}%</div>
              </div>
            ))}
          </div>
        </section>

        <div className="reviewBtnBox">
          <select
            name="sort"
            id="reviewSelect"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)} // setSortOption으로 변경
          >
            <option value="latest">최신순</option>
            <option value="rating">별점순</option>
          </select>
        </div>

        <section id="reviewList">
          {sortedReviews().map((review) => (
            <div
              key={review.reviewId}
              className="reviewItem"
              onClick={() => {
                gotoDetail(review.reviewId);
                console.log(review.reviewId);
              }}
            >
              <div className="reviewProfile">
                <img
                  src={`${review.memberImageUrl || `/user.png`}`}
                  className="reviewItemImg"
                />
                <div>
                  <h5>{review.memberNickname}</h5>
                  <p>{review.createdTime}</p>
                </div>
              </div>
              <div className="rating">
                {Array.from({ length: review.score }, (_, index) => (
                  <FontAwesomeIcon
                    key={index}
                    icon={faStar}
                    className="individualStar"
                  />
                ))}
              </div>
              <p className="reviewComment">{review.reviewComment}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ReviewInquiry;
