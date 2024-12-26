import { Utils } from "../misc/utils";

test('check utils functions', () => {
    expect(Utils.isString('asdf')).toBe(true);
});