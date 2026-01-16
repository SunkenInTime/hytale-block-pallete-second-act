"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Compass, Heart, Plus, Palette, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTabProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavTab({ href, icon, label, isActive }: NavTabProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export function Header() {
  const { user, loading } = useAuth();
  const convexUser = useQuery(api.users.getCurrent);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  // Use Convex user's name (username) if available, otherwise fall back to WorkOS user data
  const displayName = convexUser?.name || convexUser?.username || user?.firstName || "User";
  const avatarUrl = convexUser?.avatarUrl || user?.profilePictureUrl;
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Center Navigation Tabs - Absolutely centered on viewport */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-muted/50 rounded-full p-1 z-10">
        <NavTab
          href="/explore"
          icon={<Compass className="h-4 w-4" />}
          label="Explore"
          isActive={isActive("/explore")}
        />
        {user && (
          <>
            <NavTab
              href="/dashboard"
              icon={<Palette className="h-4 w-4" />}
              label="My Palettes"
              isActive={isActive("/dashboard")}
            />
            <NavTab
              href="/saved"
              icon={<Heart className="h-4 w-4" />}
              label="Saved"
              isActive={isActive("/saved")}
            />
          </>
        )}
      </nav>

      <div className="w-full h-16 px-4 flex items-center justify-between relative z-10 pointer-events-none">
        {/* Logo - Left */}
        <div className="flex items-center pointer-events-auto">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-sm">BP</span>
            </div>
            <span className="font-semibold hidden sm:inline">Block Palettes</span>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {user && (
            <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-shadow">
              <Link href="/palette/new">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Link>
            </Button>
          )}
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={avatarUrl || undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{displayName}</p>
                    {user?.email && (
                      <p className="w-[160px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                {convexUser && (
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${convexUser._id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <Palette className="mr-2 h-4 w-4" />
                    My Palettes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Palettes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/sign-out"
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="rounded-full">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
