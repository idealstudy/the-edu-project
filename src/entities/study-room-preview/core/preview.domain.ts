import { dto } from '../infrastructure/preview.dto';

const MODALITY_TO_KOREAN = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
} as const;

const CLASS_FORM_TO_KOREAN = {
  ONE_ON_ONE: '일대일',
  ONE_TO_MANY: '그룹',
} as const;

const SUBJECT_TO_KOREAN = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  OTHER: '기타',
} as const;

const SCHOOL_LEVEL_TO_KOREAN = {
  ELEMENTARY: '초등학생',
  MIDDLE: '중학생',
  HIGH: '고등학생',
} as const;

type PreviewCoreLike = {
  modality: keyof typeof MODALITY_TO_KOREAN;
  classForm: keyof typeof CLASS_FORM_TO_KOREAN;
  subjectType: keyof typeof SUBJECT_TO_KOREAN;
  schoolInfo: {
    schoolLevel: keyof typeof SCHOOL_LEVEL_TO_KOREAN;
    grade: number;
  };
};

const withKoreanLabels = <T extends PreviewCoreLike>(value: T) => ({
  ...value,
  modalityKorean: MODALITY_TO_KOREAN[value.modality],
  classFormKorean: CLASS_FORM_TO_KOREAN[value.classForm],
  subjectTypeKorean: SUBJECT_TO_KOREAN[value.subjectType],
  schoolInfo: {
    ...value.schoolInfo,
    schoolLevelKorean: SCHOOL_LEVEL_TO_KOREAN[value.schoolInfo.schoolLevel],
  },
});

const PreviewCoreDomainSchema = dto.core.transform(withKoreanLabels);

const PreviewMainDomainSchema = dto.main.transform((value) =>
  withKoreanLabels(value)
);

const PreviewSideItemDomainSchema = dto.statsItem.transform((value) =>
  withKoreanLabels(value)
);

const PreviewSideDomainSchema = dto.side.transform((value) => ({
  ...value,
  otherStudyRooms: value.otherStudyRooms.map((room) => withKoreanLabels(room)),
  teacherName: value.otherStudyRooms[0]?.teacher.name,
}));

export const domain = {
  core: PreviewCoreDomainSchema,
  main: PreviewMainDomainSchema,
  sideItem: PreviewSideItemDomainSchema,
  side: PreviewSideDomainSchema,
};
