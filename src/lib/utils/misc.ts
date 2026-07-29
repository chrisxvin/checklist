import { nanoid } from "nanoid";

export function emailToUsername(email: string) {
    // 1. 只取 @ 前面的部分
    let s = email.split("@")[0] || "";

    // 2. 去掉所有非法字符
    s = s.replace(/[^A-Za-z0-9\-_]/g, "");

    // 3. 开头不是字母时，前面补下划线
    if (!/^[A-Za-z]/.test(s)) {
        s = "_" + s;
    }

    // 4. 截断到最多 24 位
    s = s.slice(0, 24) + nanoid(6);

    // 6. 最终校验
    if (!/^[A-Za-z][A-Za-z0-9\-_]{2,29}$/.test(s)) {
        return null; // 或抛出错误
    }

    return s;
}
