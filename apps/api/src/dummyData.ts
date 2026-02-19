/**
 * dummyData.ts
 * TourAPI 장애/쿼터 제한 시 반환할 폴백 더미 데이터
 * 최소 20개 항목
 */

export interface NormalizedPlace {
  contentId: string;
  contentTypeId: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  areaCode: string;
  mapx: number;
  mapy: number;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  overview?: string;
}

export const DUMMY_PLACES: NormalizedPlace[] = [
  {
    contentId: 'dummy-001',
    contentTypeId: '12',
    title: '경복궁',
    addr1: '서울특별시 종로구 사직로 161',
    areaCode: '1',
    mapx: 126.977041,
    mapy: 37.579617,
    overview: '조선왕조의 법궁으로, 고요한 이른 아침 방문을 권장합니다.',
  },
  {
    contentId: 'dummy-002',
    contentTypeId: '14',
    title: '국립중앙도서관',
    addr1: '서울특별시 서초구 반포대로 201',
    areaCode: '1',
    mapx: 127.009965,
    mapy: 37.495104,
    overview: '독서와 사색에 최적화된 조용한 공간입니다.',
  },
  {
    contentId: 'dummy-003',
    contentTypeId: '12',
    title: '창덕궁',
    addr1: '서울특별시 종로구 율곡로 99',
    areaCode: '1',
    mapx: 126.991141,
    mapy: 37.579617,
  },
  {
    contentId: 'dummy-004',
    contentTypeId: '15',
    title: '서울숲',
    addr1: '서울특별시 성동구 뚝섬로 273',
    areaCode: '1',
    mapx: 127.037803,
    mapy: 37.543791,
  },
  {
    contentId: 'dummy-005',
    contentTypeId: '14',
    title: '국립현대미술관 서울관',
    addr1: '서울특별시 종로구 삼청로 30',
    areaCode: '1',
    mapx: 126.980652,
    mapy: 37.580231,
  },
  {
    contentId: 'dummy-006',
    contentTypeId: '12',
    title: '해운대 달맞이 언덕',
    addr1: '부산광역시 해운대구 해운대해변로 264',
    areaCode: '6',
    mapx: 129.161479,
    mapy: 35.162798,
  },
  {
    contentId: 'dummy-007',
    contentTypeId: '15',
    title: '태종대',
    addr1: '부산광역시 영도구 전망로 24',
    areaCode: '6',
    mapx: 129.082785,
    mapy: 35.051983,
  },
  {
    contentId: 'dummy-008',
    contentTypeId: '12',
    title: '감천문화마을',
    addr1: '부산광역시 사하구 감내2로 203',
    areaCode: '6',
    mapx: 129.010578,
    mapy: 35.097701,
  },
  {
    contentId: 'dummy-009',
    contentTypeId: '12',
    title: '월정사',
    addr1: '강원도 평창군 진부면 오대산로 374-8',
    areaCode: '32',
    mapx: 128.543773,
    mapy: 37.731258,
  },
  {
    contentId: 'dummy-010',
    contentTypeId: '12',
    title: '설악산국립공원',
    addr1: '강원도 속초시 설악산로 833',
    areaCode: '32',
    mapx: 128.465639,
    mapy: 38.119420,
  },
  {
    contentId: 'dummy-011',
    contentTypeId: '15',
    title: '남이섬',
    addr1: '강원도 춘천시 남산면 남이섬길 1',
    areaCode: '32',
    mapx: 127.516702,
    mapy: 37.804256,
  },
  {
    contentId: 'dummy-012',
    contentTypeId: '12',
    title: '불국사',
    addr1: '경상북도 경주시 불국로 385',
    areaCode: '35',
    mapx: 129.332543,
    mapy: 35.790019,
  },
  {
    contentId: 'dummy-013',
    contentTypeId: '12',
    title: '첨성대',
    addr1: '경상북도 경주시 인왕동 839-1',
    areaCode: '35',
    mapx: 129.218093,
    mapy: 35.835207,
  },
  {
    contentId: 'dummy-014',
    contentTypeId: '12',
    title: '한라산 국립공원',
    addr1: '제주특별자치도 제주시 1100로 2070-61',
    areaCode: '39',
    mapx: 127.091826,
    mapy: 33.361946,
  },
  {
    contentId: 'dummy-015',
    contentTypeId: '12',
    title: '성산일출봉',
    addr1: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
    areaCode: '39',
    mapx: 126.942370,
    mapy: 33.458429,
  },
  {
    contentId: 'dummy-016',
    contentTypeId: '14',
    title: '제주돌문화공원',
    addr1: '제주특별자치도 제주시 조천읍 남조로 2023',
    areaCode: '39',
    mapx: 126.702521,
    mapy: 33.434742,
  },
  {
    contentId: 'dummy-017',
    contentTypeId: '14',
    title: '국립부여박물관',
    addr1: '충청남도 부여군 부여읍 금성로 5',
    areaCode: '34',
    mapx: 126.912035,
    mapy: 36.276543,
  },
  {
    contentId: 'dummy-018',
    contentTypeId: '12',
    title: '담양 죽녹원',
    addr1: '전라남도 담양군 담양읍 죽녹원로 119',
    areaCode: '38',
    mapx: 126.988651,
    mapy: 35.320978,
  },
  {
    contentId: 'dummy-019',
    contentTypeId: '14',
    title: '국립광주박물관',
    addr1: '광주광역시 북구 하서로 110',
    areaCode: '5',
    mapx: 126.916502,
    mapy: 35.177013,
  },
  {
    contentId: 'dummy-020',
    contentTypeId: '15',
    title: '수원화성',
    addr1: '경기도 수원시 장안구 연무동 190',
    areaCode: '31',
    mapx: 127.013798,
    mapy: 37.288147,
  },
];
