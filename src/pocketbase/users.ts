import pb from "./pb.js";

const users = pb.collection("users");

export const authUser = async (email: string, password: string) => {
  const res = await users.authWithPassword(email, password);
  console.log(res);
  const data = { token: res.token, record: res.record };

  return data;
};
