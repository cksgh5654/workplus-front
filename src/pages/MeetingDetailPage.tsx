import { ChangeEvent, useEffect, useState } from "react";
import Datepicker from "../components/common/DatePicker";
import Input from "../components/common/Input";
import AutoComplete from "../components/common/AutoComplete";
import ReactDatePiker from "react-datepicker";
import Button from "../components/common/Button";
import { UserData } from "../types";
import { useSelectedUserStore } from "../store/useUserStore";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { ENDPOINT } from "../utils/endpoints";

const MeetingDetailPage: React.FC = () => {
  const [userName, setUserName] = useState<{
    userId: string;
    email: string;
    username: string;
    token?: string;
  }>({ userId: "", email: "", username: "" });
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
  const [agenda, setAgenda] = useState("");
  const [creatorId, setCreatorId] = useState(""); // 회의 생성자 id
  const [creatorUsername, setCreatorUsername] = useState(""); // 회의 생성자 이름
  const navigate = useNavigate();
  const { selectedUsers, setSelectedUsers, setDeleteUsers, setGetUsers } =
    useSelectedUserStore();
  const loginUser = localStorage.getItem("user");
  const selectedUserName = selectedUsers.map((user) => user.username);
  const param = useParams(); // 674effc4a19783b2f22fbbea
  // console.log("param.meetingId ", param.meetingId);

  // date에서 시간만 string변환
  const hours = selectedTime?.getHours().toString().padStart(2, "0");
  const minutes = selectedTime?.getMinutes().toString().padStart(2, "0");
  const selectedTimeString = `${hours}:${minutes}`;

  const handleUserSelect = (user: UserData) => {
    setSelectedUsers(user);
  };
  const handleClickAgenda = (e: ChangeEvent<HTMLInputElement>) => {
    setAgenda(e.target.value);
  };
  const handleClickCancel = (user: UserData) => {
    setDeleteUsers(user);
  };

  // 페이지 들어갔을때 입력했던 데이터 받아오기
  const getUserInfo = async () => {
    try {
      const request = await api.get(`${ENDPOINT.METTING}/${param.meetingId}`);

      const meeting = request.data.data.meeting;
      console.log("meeting data ", meeting);

      const newSelectedUsers = meeting.attendant.map((username: string) => ({
        username,
      }));

      // console.log("selectedUsers ", selectedUsers);
      setGetUsers(newSelectedUsers);
      setAgenda(meeting.agenda);
      setStartDate(meeting.date);

      const DateTime = new Date();
      const [hours, minutes] = meeting.startTime.split(":");
      DateTime?.setHours(parseInt(hours, 10));
      DateTime?.setMinutes(parseInt(minutes, 10));
      DateTime?.setSeconds(0);
      DateTime?.setMilliseconds(0);
      setSelectedTime(DateTime);
      setCreatorId(meeting.creatorId);
      setCreatorUsername(meeting.creatorUsername);
    } catch (err) {
      console.log("Error getUserInfo ", err);
    }
  };

  // 수정버튼
  const handleClickFix = async () => {
    const data = {
      creatorId: userName.userId,
      attendant: selectedUserName,
      date: startDate,
      startTime: selectedTimeString,
      agenda: agenda,
    };

    try {
      const request = await api.put(
        `${ENDPOINT.METTING}/${param.meetingId}`,
        data
      );
      if (agenda === "") {
        alert("회의 안건을 입력해주세요");
      } else if (selectedUserName.length === 0) {
        alert("참여자를 입력해주세요");
      } else {
        console.log("Fix meetingDetail data ", request.data);
        alert("회의 수정 완료");
        navigate("/");
      }
    } catch (err) {
      console.log("Error meetingDetail Fix ", err);
      alert("회의 수정 실패");
    }
  };

  // 삭제버튼
  const handleClickDelete = async () => {
    try {
      const request = await api.delete(
        `${ENDPOINT.METTING}/${param.meetingId}`
      );
      console.log("Delete meetingDetail data ", request.data);
      alert("삭제완료");
      navigate("/");
    } catch (err) {
      console.log("Error meetingDetail delete ", err);
      alert("삭제실패");
    }
  };

  useEffect(() => {
    if (loginUser) {
      const user = JSON.parse(loginUser);
      console.log("loginUser ", user.userId);
      setUserName(user);
      getUserInfo();
    }
  }, []);

  useEffect(() => {
    console.log("selectedUsers ", selectedUsers);
  }, [selectedUsers]);

  // console.log("creatorid ", creatorId);
  // console.log("userId ", userName.userId);
  return (
    <>
      <div className="w-full flex flex-col space-y-5 items-center">
        <p className="mt-20">회의 일정 상세 페이지</p>

        <div className="w-1/6">
          {creatorId !== userName.userId ? (
            <Datepicker
              className="w-full px-4 py-2 border rounded-md"
              dateFormat="yyyy/MM/dd"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              id={"날짜"}
              readOnly
            />
          ) : (
            <Datepicker
              className="w-full px-4 py-2 border rounded-md"
              dateFormat="yyyy/MM/dd"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              id={"날짜"}
            />
          )}
        </div>
        <div className="w-1/6">
          {creatorId !== userName.userId ? (
            <Input
              placeholder="회의 안건"
              id={"회의 안건"}
              value={agenda}
              onChange={handleClickAgenda}
              readOnly
            />
          ) : (
            <Input
              placeholder="회의 안건"
              id={"회의 안건"}
              value={agenda}
              onChange={handleClickAgenda}
            />
          )}
        </div>
        <div className="w-1/6">
          <Input
            placeholder="생성자"
            id={"생성자"}
            value={creatorUsername}
            readOnly
          />
        </div>
        <div className="w-1/6">
          {creatorId !== userName.userId ? (
            <AutoComplete
              onSelect={handleUserSelect}
              id={"참여자"}
              readOnly={true}
            />
          ) : (
            <AutoComplete
              onSelect={handleUserSelect}
              id={"참여자"}
              readOnly={false}
            />
          )}

          <div className="mt-5">
            {selectedUsers.map((user, index) => (
              <span
                key={index}
                onClick={() => handleClickCancel(user)}
                className={
                  creatorId !== userName.userId
                    ? "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 pointer-events-none"
                    : "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 hover:bg-[#a3aee6] transition duration-10"
                }
              >
                {user.username}
              </span>
            ))}
          </div>
        </div>
        <div className="w-1/6">
          {creatorId !== userName.userId ? (
            <ReactDatePiker
              className="px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2"
              selected={selectedTime}
              onChange={(date: Date | null) => setSelectedTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              dateFormat="hh:mm aa"
              readOnly
            />
          ) : (
            <ReactDatePiker
              className="px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2"
              selected={selectedTime}
              onChange={(date: Date | null) => setSelectedTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              dateFormat="hh:mm aa"
            />
          )}
        </div>
        <div className="w-1/6 flex justify-between">
          <div className="w-1/3">
            {creatorId !== userName.userId ? null : (
              <Button btnText="수정" onClick={handleClickFix} />
            )}
          </div>
          <div className="w-1/3">
            {creatorId !== userName.userId ? null : (
              <Button
                className="px-4 py-3 bg-[#f00] text-white rounded-md hover:bg-[#ba0000] transition duration-10"
                btnText="삭제"
                onClick={handleClickDelete}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeetingDetailPage;
