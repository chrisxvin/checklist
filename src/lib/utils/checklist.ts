import { DateTime } from "luxon";
import { hashLikeRandomId } from "./crypto";

export function generateNewSlug() {
    return hashLikeRandomId(8);
}

/** 统计 Run 快照中成功/失败/跳过/未处理的数量 */
export function summarizeSteps(steps: IRunStep[]): IRunSummary {
    const summary: IRunSummary = { success: 0, failure: 0, skipped: 0, unresolved: 0 };
    for (const step of steps) {
        if (step.checked === true) summary.success++;
        else if (step.checked === false) summary.failure++;
        else if (step.resolvedAt != null) summary.skipped++;
        else summary.unresolved++;
    }
    return summary;
}

/** 按 groupName 分组步骤（未命名的归入默认组），保持原顺序 */
export function groupSteps<T extends IStep>(steps: T[]): { groupName: string; steps: T[] }[] {
    const groups: { groupName: string; steps: T[] }[] = [];
    for (const step of steps) {
        const name = step.groupName?.trim() ?? "";
        const last = groups[groups.length - 1];
        if (last && last.groupName === name) {
            last.steps.push(step);
        } else {
            groups.push({ groupName: name, steps: [step] });
        }
    }
    return groups;
}

/** 耗时格式化：不足 1 分钟显示秒，否则显示 x小时x分 或 x分x秒 */
export function formatDuration(ms: number | null | undefined): string {
    if (ms == null) return "-";
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}小时${minutes}分`;
    if (minutes > 0) return `${minutes}分${seconds}秒`;
    return `${seconds}秒`;
}

export function formatDateTime(date: Date | string | null | undefined): string {
    if (date == null) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return DateTime.fromJSDate(d).setLocale("zh-CN").toFormat("yyyy-MM-dd HH:mm");
}

export function formatDate(date: Date | string | null | undefined): string {
    if (date == null) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return DateTime.fromJSDate(d).setLocale("zh-CN").toFormat("yyyy-MM-dd");
}
