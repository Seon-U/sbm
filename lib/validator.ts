import z from 'zod';

export type ValidError = Record<
  string,
  { errors: string[]; value?: FormDataEntryValue | null }
>;

// export type ValidError = {
//   success: false;
//   error: Record<
//     string,
//     { errors: string[]; value?: FormDataEntryValue | null }
//   >;
// };

export const validate = <T extends z.ZodObject>(
  zobj: T,
  formData: FormData
): [ValidError] | [undefined, z.core.output<T>] =>
  validateObject(zobj, Object.fromEntries(formData.entries()));

export const validateObject = <T extends z.ZodObject>(
  zobj: T,
  obj: Record<string, FormDataEntryValue | string | unknown>
): [ValidError] | [undefined, z.core.output<T>] => {
  const validator = zobj.safeParse(obj);

  if (!validator.success) {
    const err = z.treeifyError(validator.error).properties as ValidError;

    for (const [prop, value] of Object.entries(obj)) {
      if (prop.startsWith('$')) continue;
      if (!err[prop]) err[prop] = { errors: [] };

      err[prop].value = value as string;

      // err[prop] = {...(err[prop] ?? {errors: []}), value};
    }
    return [err];
  } else {
    return [undefined, validator.data];
  }
};
