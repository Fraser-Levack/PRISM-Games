import "../styles/GameCard.css"
import { Link } from 'react-router-dom'

interface GameCardProps {
  children?: React.ReactNode
  title: string
  imageSrc?: string
  link: string
}

export default function GameCard({ children, title, imageSrc, link }: GameCardProps) {
  return (
    <Link to={link} className="gameCard">
      <div className="header">
        <h2>{title}</h2>
        {imageSrc && <img src={imageSrc} alt={title} />}
      </div>
      {children}
    </Link>
  )
}