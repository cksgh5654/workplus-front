import Button from "../common/Button";
import profileImg from "/img/profileImg.png";
import Modal from "../common/Modal";
import Input from "../common/Input";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import api from "../../utils/api";
import { ENDPOINT } from "../../utils/endpoints";
// import ToastNotification from "../common/ToastNotification";

type UserInfo = {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  userImage?: string;
};

type MainProfileProps = {
  user: UserInfo;
  onEdit: (updatedUser: UserInfo) => void;
};

const MainProfile: React.FC<MainProfileProps> = ({ user, onEdit }) => {
  /* 이미지 업로드 */
  const [imgFile, setImgFile] = useState<File>();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  /* 이름 수정 */
  const [editName, setEditName] = useState(user.name || "");
  const [toastMessage, setToastMessage] = useState("");

  /* 모달 */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const dummyData = {
    title: "ooo 개발 회의",
    date: "2024.11.26",
    organizer: "김철수",
    agenda: "회의 안건 내용",
  };

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setEditName(target.value);
  };
  /* 이름 수정 하기*/
  const handleClickEdit = async () => {
    console.log("이름 수정 요청 시작");

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const { userId } = JSON.parse(storedUser);
      const response = await api.patch(`${ENDPOINT.USER_PROFILE}/username`, {
        username: editName,
        id: userId,
      });

      if (response.status === 200 || response.status === 204) {
        onEdit({ ...user, name: editName });

        setToastMessage("이름이 성공적으로 수정되었습니다!");
      }
    } catch (err) {
      console.error("Error updating name:", err);
      setToastMessage("이름 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };
  /* input에도 현재 이름 보이게 */
  useEffect(() => {
    setEditName(user.name || "");
  }, [user.name]);

  /* 이미지 업로드 */
  const handleImageClick = () => {
    // 이미지 클릭 시 input 요소 클릭
    inputFileRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImgFile(file);
    console.log("파일이름", file);

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const { userId } = JSON.parse(storedUser);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file); // 파일이 있을 경우에만 추가
      } else {
        // 파일이 없으면 추가하지 않음
        console.error("No file selected");
        return;
      }
      const response = await api.put(
        `${ENDPOINT.USER_PROFILE_IMAGE}/${userId}`,
        formData
      );
      console.log("응답2", response);
      if (response.status === 200 || response.status === 204) {
        console.log("파일 업로드 성공");
        // 업로드 후 처리 로직 (예: 이미지 URL 업데이트)
        const uploadedImageUrl = response.data.data.imgUrl;
        console.log(uploadedImageUrl);
        onEdit({ ...user, userImage: uploadedImageUrl });
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-lg">Profile</h2>
      <div className="flex flex-col justify-center items-center mt-20">
        <div>
          <input
            type="file"
            ref={inputFileRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <img
            src={user.userImage || profileImg}
            alt="프로필 사진"
            className="cursor-pointer w-36 h-36 object-cover rounded-full"
            onClick={handleImageClick}
          />
        </div>
        <h3 className="text-xl font-semibold pt-3">{user.name}</h3>
        <p className="text-sm">{user.email}</p>
      </div>
      <div className="pt-14">
        {/* 잠시 주석 처리 */}
        {/* <p className="text-sm">성</p>
        <Input
          type="text"
          name="name"
          value={editName}
          className="mt-2"
          onChange={handleChange}
        /> */}
        <p className="text-sm pt-4">이름</p>
        <Input
          type="text"
          name="name"
          value={editName}
          className="mt-2"
          onChange={handleChange}
        />
        <Button
          btnText="이름 수정"
          className="mt-16"
          onClick={handleClickEdit}
        />
        {/* <ToastNotification message={toastMessage} /> */}
        <div>
          <Button
            btnText="모달 테스트 버튼"
            onClick={openModal}
            className="mt-10"
          />
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={dummyData.title}
            date={dummyData.date}
            organizer={dummyData.organizer}
            agenda={dummyData.agenda}
          />
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
