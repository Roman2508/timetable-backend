export const getCurrentSemester = (
  firstSemesterStart: string,
  selectedSemester: number,
  yearOfAdmission: number,
): number => {
  const curentYear = Number(firstSemesterStart.split('.')[2]);
  const difference = curentYear - yearOfAdmission;
  const yearSemesters = {};

  if (difference === 0) {
    yearSemesters['1'] = 1;
    yearSemesters['2'] = 2;
  }
  if (difference === 1) {
    yearSemesters['1'] = 3;
    yearSemesters['2'] = 4;
  }
  if (difference === 2) {
    yearSemesters['1'] = 5;
    yearSemesters['2'] = 6;
  }

  return yearSemesters[selectedSemester];
};
