import React from 'react';

import Image from 'next/image';

const InvitationNotice = () => {
  return (
    <>
      <Image
        src="/common/info.svg"
        alt="alert"
        width={20}
        height={20}
        className="relative top-[5px]"
      />
      <div>
        <p>학생을 초대하면 연결된 보호자는 자동으로 함께 입장합니다.</p>
        <p>각 수업 노트는 보호자에게 공개하거나 비공개로 설정할 수 있습니다.</p>
        <p>학생과 연결되지 않은 보호자는 스터디룸에 입장할 수 없습니다.</p>
      </div>
    </>
  );
};

export default InvitationNotice;
