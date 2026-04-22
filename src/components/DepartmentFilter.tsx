"use client";

import { ALL_DEPARTMENTS } from "@/lib/notices";

interface DepartmentFilterProps {
  departments: string[];
  selectedDepartment: string;
  onChange: (department: string) => void;
}

export default function DepartmentFilter({
  departments,
  selectedDepartment,
  onChange
}: DepartmentFilterProps) {
  const hasDepartments = departments.length > 0;

  return (
    <label className="flex w-full min-w-0 flex-col gap-1 text-sm text-slate-700 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
      <span className="shrink-0">부서</span>
      <select
        value={selectedDepartment}
        onChange={(event) => onChange(event.target.value)}
        disabled={!hasDepartments}
        className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring sm:min-w-[180px] sm:max-w-[320px]"
      >
        <option value={ALL_DEPARTMENTS}>전체 부서</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
      {!hasDepartments ? <span className="text-xs text-slate-500">부서 데이터 없음</span> : null}
    </label>
  );
}
