import { cn } from '../../lib/utils';

const variants = {
	default:  'bg-primary text-primary-foreground',
	secondary:'bg-secondary text-secondary-foreground',
	gold:     'bg-yellow-100 text-yellow-800 border-yellow-300',
	silver:   'bg-gray-100 text-gray-700 border-gray-300',
	bronze:   'bg-orange-100 text-orange-700 border-orange-300',
};

export function Badge( { className, variant = 'default', ...props } ) {
	return (
		<span
			className={ cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
				variants[ variant ] ?? variants.default,
				className
			) }
			{ ...props }
		/>
	);
}
