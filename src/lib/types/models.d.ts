declare global {
    interface ITodoItem {
        id: string;
        checked: boolean;
        content: string;
        comment?: string;
    }

    interface ICheckItem extends ITodoItem {
        shouldBe: string;
    }

    interface ICheckList {
        id: string;
        title: string;
        items: ICheckItem[];
    }
}

export { };
