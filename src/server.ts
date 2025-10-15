import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => {
  console.log(`API on http://${ENV.HOST}:${ENV.PORT}`);
});
