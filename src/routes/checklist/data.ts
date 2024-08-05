import { browser } from "$app/environment";

const emptyItem: ICheckItem = {
    _id: "",
    content: "",
    checked: false,
    shouldBe: "",
    comment: "",
};
const emptyList: ICheckList = {
    _id: "",
    name: "",
    items: [],
};

const KEY_CHECK_LIST_PREFIX = "CheckList-";
const KEY_CHECK_LIST_IDS = KEY_CHECK_LIST_PREFIX + "IDS";
function _getCheckListStorageKey(id: string): string {
    return KEY_CHECK_LIST_PREFIX + id;
}

export function loadCheckListIds(): string[] {
    if (browser) {
        const ids = window.localStorage.getItem(KEY_CHECK_LIST_IDS);
        return ids ? JSON.parse(ids) : [];
    } else {
        return [];
    }
}

export function saveCheckListIds(ids: string[]): void {
    window.localStorage.setItem("CheckList-IDS", JSON.stringify(ids));
}

export function loadSingleCheckList(id: string): ICheckList {
    if (browser) {
        const key = _getCheckListStorageKey(id);
        const listStr = window.localStorage.getItem(key);
        const list = listStr ? (JSON.parse(listStr) as ICheckList) : { ...emptyList };
        list._id = id;
        return list;
    } else {
        return emptyList;
    }
}

export function saveSingleCheckList(list: ICheckList): void {
    if (browser) {
        const key = _getCheckListStorageKey(list._id);
        window.localStorage.setItem(key, JSON.stringify(list));

        const ids = loadCheckListIds();
        if (!ids.includes(list._id)) {
            ids.push(list._id);
            saveCheckListIds(ids);
        }
    }
}
