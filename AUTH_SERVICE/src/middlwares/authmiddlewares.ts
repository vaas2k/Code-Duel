


const authMiddlewares = {
    requireAuth: (req: any, res: any, next: any) => {

        try {

            if (req.session.user) {
                next();
            } else {
                res.status(401).json({ message: "Unauthorized" });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
}