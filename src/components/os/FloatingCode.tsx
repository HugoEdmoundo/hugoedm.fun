import { motion } from "framer-motion";

const codeSnippets = [
  `const app = express()`,
  `prisma.user.findMany()`,
  `export default function`,
  `useEffect(() => {}, [])`,
  `SELECT * FROM users`,
  `git commit -m "feat"`,
  `npm run build`,
  `docker compose up`,
  `async function handler`,
  `return NextResponse.json`,
];

export default function FloatingCode() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.06, 0.06, 0],
            y: [0, -60],
            x: [0, (i % 2 === 0 ? 1 : -1) * 15],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "linear",
          }}
          className="absolute font-mono text-[10px] text-primary/30 whitespace-nowrap select-none"
          style={{
            left: `${8 + (i * 17) % 85}%`,
            top: `${15 + (i * 23) % 70}%`,
          }}
        >
          {snippet}
        </motion.div>
      ))}
    </div>
  );
}
