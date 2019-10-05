class Env {
  isAdmin = req => req.headers.signature;
  isCustomer = req => !req.headers.signature;
}

export default Env;
