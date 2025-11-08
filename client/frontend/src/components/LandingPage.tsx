import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[url('https://static.vecteezy.com/system/resources/thumbnails/020/933/072/small/abstract-blur-gradient-background-vector.jpg')] bg-no-repeat bg-center bg-cover h-screen w-screen text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center space-y-6"
      >
        {/* Website Title */}
        <h1 className="text-9xl font-bold tracking-tight text-white">
          MedAssist
        </h1>

        {/* Slogan */}
        <p className="text-lg md:text-xl text-muted-foreground text-stone-200">
          Your Personal AI-Powered Medical Assistant to Manage Health Information Effortlessly.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="default"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
